-- ARCLOG migration 00018: Seed starter league + award weekly XP on learning activity.

insert into public.leagues (slug, title, season_label, starts_at, ends_at)
values (
  'bronze-weekly',
  'Bronze League',
  'This week',
  date_trunc('week', timezone('utc', now())),
  date_trunc('week', timezone('utc', now())) + interval '7 days'
)
on conflict (slug) do update
set
  title = excluded.title,
  season_label = excluded.season_label,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at;

create or replace function public.record_learning_activity (p_xp integer default 0)
returns public.user_streaks
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  today date := (timezone('utc', now()))::date;
  row public.user_streaks;
  xp_gain integer := greatest(coalesce(p_xp, 0), 0);
begin
  if uid is null then
    raise exception 'Not authenticated';
  end if;

  insert into public.user_streaks (user_id, current_streak, longest_streak, last_activity_date)
  values (uid, 1, 1, today)
  on conflict (user_id) do update set
    current_streak = case
      when public.user_streaks.last_activity_date = today then public.user_streaks.current_streak
      when public.user_streaks.last_activity_date = today - 1 then public.user_streaks.current_streak + 1
      else 1
    end,
    longest_streak = greatest(
      public.user_streaks.longest_streak,
      case
        when public.user_streaks.last_activity_date = today then public.user_streaks.current_streak
        when public.user_streaks.last_activity_date = today - 1 then public.user_streaks.current_streak + 1
        else 1
      end
    ),
    last_activity_date = today,
    updated_at = now()
  returning * into row;

  insert into public.user_stats (user_id, xp)
  values (uid, xp_gain)
  on conflict (user_id) do update set
    xp = public.user_stats.xp + xp_gain,
    updated_at = now();

  if xp_gain > 0 then
    update public.league_members lm
    set weekly_xp = lm.weekly_xp + xp_gain
    from public.leagues l
    where lm.league_id = l.id
      and lm.user_id = uid
      and l.starts_at <= timezone('utc', now())
      and l.ends_at > timezone('utc', now());
  end if;

  return row;
end;
$$;

grant execute on function public.record_learning_activity (integer) to authenticated;

-- ARCLOG migration 00012: Social — friends, leagues, challenges

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (requester_id <> addressee_id),
  unique (requester_id, addressee_id)
);

create index if not exists idx_friendships_addressee on public.friendships (addressee_id, status);
create index if not exists idx_friendships_requester on public.friendships (requester_id, status);

drop trigger if exists friendships_set_updated_at on public.friendships;
create trigger friendships_set_updated_at
before update on public.friendships
for each row
execute function public.set_updated_at();

create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  season_label text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists public.league_members (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  weekly_xp integer not null default 0 check (weekly_xp >= 0),
  joined_at timestamptz not null default now(),
  unique (league_id, user_id)
);

create index if not exists idx_league_members_league_xp
  on public.league_members (league_id, weekly_xp desc);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  challenger_id uuid not null references public.profiles (id) on delete cascade,
  opponent_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid references public.lessons (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'completed', 'declined', 'cancelled')),
  challenger_score integer,
  opponent_score integer,
  winner_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (challenger_id <> opponent_id)
);

create index if not exists idx_challenges_opponent on public.challenges (opponent_id, status);
create index if not exists idx_challenges_challenger on public.challenges (challenger_id, status);

-- Friend list helper (accepted only).
create or replace function public.list_friends ()
returns table (
  friend_id uuid,
  display_name text,
  profile_picture_url text,
  xp integer,
  current_streak integer
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    coalesce(p.display_name, p.first_name, 'Friend'),
    p.profile_picture_url,
    coalesce(s.xp, 0),
    coalesce(st.current_streak, 0)
  from public.friendships f
  join public.profiles p on p.id = case
    when f.requester_id = auth.uid() then f.addressee_id
    else f.requester_id
  end
  left join public.user_stats s on s.user_id = p.id
  left join public.user_streaks st on st.user_id = p.id
  where f.status = 'accepted'
    and (f.requester_id = auth.uid() or f.addressee_id = auth.uid());
$$;

grant execute on function public.list_friends () to authenticated;

comment on table public.friendships is 'Directed friend requests; accepted pairs are mutual friends.';
comment on table public.leagues is 'Seasonal XP leagues for leaderboards.';
comment on table public.challenges is '1v1 lesson challenges between friends.';

import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { listFriends } from "@/lib/actions/social";
import {
  LeaderboardView,
  type LeaderboardEntry,
} from "@/components/dashboard/leaderboard-view";

const LEAGUE_SLUG = "bronze-weekly";

export default async function LeaderboardPage() {
  const user = await requireUserOrRedirect("/me/leaderboard");
  const supabase = await createClient();

  let { data: league } = await supabase
    .from("leagues")
    .select("id, title, season_label, starts_at, ends_at")
    .eq("slug", LEAGUE_SLUG)
    .maybeSingle();

  if (!league) {
    const { data: latest } = await supabase
      .from("leagues")
      .select("id, title, season_label, starts_at, ends_at")
      .order("starts_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    league = latest;
  }

  if (league) {
    await supabase.from("league_members").upsert(
      {
        league_id: league.id,
        user_id: user.id,
        weekly_xp: 0,
      },
      { onConflict: "league_id,user_id", ignoreDuplicates: true }
    );
  }

  const [{ data: profile }, friends, membersRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    listFriends(),
    league
      ? supabase
          .from("league_members")
          .select(
            "user_id, weekly_xp, profile:profiles(display_name, first_name)"
          )
          .eq("league_id", league.id)
          .order("weekly_xp", { ascending: false })
          .limit(50)
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const friendIds = new Set(
    (friends as Array<{ friend_id?: string }>).map((f) => f.friend_id).filter(Boolean)
  );

  const displayName =
    profile?.first_name ?? profile?.display_name ?? "You";

  const entries: LeaderboardEntry[] = (membersRes.data ?? []).map((m) => {
    const profileRow = Array.isArray(m.profile) ? m.profile[0] : m.profile;
    return {
      userId: m.user_id,
      displayName:
        m.user_id === user.id
          ? displayName
          : profileRow?.first_name ??
            profileRow?.display_name ??
            "Learner",
      weeklyXp: m.weekly_xp ?? 0,
      isCurrentUser: m.user_id === user.id,
      isFriend: friendIds.has(m.user_id),
    };
  });

  const totalWeeklyXp = entries.reduce((sum, e) => sum + e.weeklyXp, 0);
  const memberCount = entries.length;

  return (
    <LeaderboardView
      leagueTitle={league?.title ?? "Bronze League"}
      seasonLabel={league?.season_label ?? "This week"}
      entries={entries}
      memberCount={memberCount}
      totalWeeklyXp={totalWeeklyXp}
    />
  );
}

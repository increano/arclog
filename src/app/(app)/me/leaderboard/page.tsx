import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  LeaderboardView,
  type LeaderboardEntry,
} from "@/components/dashboard/leaderboard-view";

export default async function LeaderboardPage() {
  const user = await requireUserOrRedirect("/me/leaderboard");
  const supabase = await createClient();

  const [{ data: profile }, { data: stats }, { data: leagues }] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_stats").select("xp").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("leagues")
      .select("id, title, season_label")
      .order("starts_at", { ascending: false })
      .limit(1),
  ]);

  const displayName =
    profile?.first_name ?? profile?.display_name ?? "You";
  const myXp = stats?.xp ?? 0;
  const league = leagues?.[0];

  let entries: LeaderboardEntry[] = [];

  if (league) {
    const { data: members } = await supabase
      .from("league_members")
      .select(
        "user_id, weekly_xp, profile:profiles(display_name, first_name)"
      )
      .eq("league_id", league.id)
      .order("weekly_xp", { ascending: false })
      .limit(20);

    entries = (members ?? []).map((m) => {
      const profileRow = Array.isArray(m.profile) ? m.profile[0] : m.profile;
      return {
        userId: m.user_id,
        displayName:
          profileRow?.first_name ??
          profileRow?.display_name ??
          "Learner",
        weeklyXp: m.weekly_xp ?? 0,
        isCurrentUser: m.user_id === user.id,
      };
    });
  }

  if (entries.length < 7) {
    const demo: LeaderboardEntry[] = [
      { userId: "demo-1", displayName: "Sarah Chen", weeklyXp: 2150 },
      { userId: "demo-2", displayName: "Gabriel M.", weeklyXp: 1840 },
      { userId: "demo-3", displayName: "Lucas V.", weeklyXp: 1620 },
      { userId: "demo-4", displayName: "Alex Rivera", weeklyXp: 1450, isFriend: true },
      { userId: "demo-5", displayName: "Fatima K.", weeklyXp: 1320 },
      {
        userId: user.id,
        displayName,
        weeklyXp: Math.max(myXp, 1280),
        isCurrentUser: true,
      },
      { userId: "demo-7", displayName: "David P.", weeklyXp: 1110, isFriend: true },
    ];
    entries = demo.sort((a, b) => b.weeklyXp - a.weeklyXp);
  }

  return (
    <LeaderboardView
      leagueTitle={league?.title ?? "Bronze League"}
      seasonLabel={league?.season_label ?? "Weekly season"}
      entries={entries}
    />
  );
}

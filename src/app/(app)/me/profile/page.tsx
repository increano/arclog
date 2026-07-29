import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { listUserAchievements } from "@/lib/learning/queries";
import { ProfileView } from "@/components/dashboard/profile-view";

export default async function ProfilePage() {
  const user = await requireUserOrRedirect("/me/profile");
  const supabase = await createClient();

  const [
    { data: profile },
    { data: streak },
    { data: stats },
    { count: bookmarkCount },
    { count: noteCount },
    achievements,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, display_name, preferred_translation_slug")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("user_streaks")
      .select("current_streak, longest_streak")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("user_stats")
      .select("xp, bible_iq, mastery_percent, lessons_completed")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("bookmarks").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("notes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
    listUserAchievements(user.id),
  ]);

  return (
    <ProfileView
      displayName={profile?.first_name ?? profile?.display_name ?? "Learner"}
      preferredSlug={
        profile?.preferred_translation_slug ?? DEFAULT_TRANSLATION_SLUG
      }
      currentStreak={streak?.current_streak ?? 0}
      longestStreak={streak?.longest_streak ?? 0}
      xp={stats?.xp ?? 0}
      bibleIq={stats?.bible_iq ?? 0}
      masteryPercent={Number(stats?.mastery_percent ?? 0)}
      lessonsCompleted={stats?.lessons_completed ?? 0}
      bookmarkCount={bookmarkCount ?? 0}
      noteCount={noteCount ?? 0}
      achievements={achievements.map((row) => {
        const achievement = Array.isArray(row.achievement)
          ? row.achievement[0]
          : row.achievement;
        return {
          id: row.id,
          title: achievement?.title ?? "Badge",
          description: achievement?.description ?? null,
          unlockedAt: row.unlocked_at,
        };
      })}
    />
  );
}

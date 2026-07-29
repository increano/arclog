import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_TRANSLATION_SLUG } from "@/lib/supabase/env";
import { LearnerDashboard } from "@/components/dashboard/learner-dashboard";

export default async function MePage() {
  const user = await requireUserOrRedirect("/me");
  const supabase = await createClient();

  const [
    { data: profile },
    { data: streak },
    { data: stats },
    { count: bookmarkCount },
    { count: noteCount },
    { data: latest },
    { count: achievementCount },
  ] =
    await Promise.all([
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
      supabase
        .from("latest_reading_progress")
        .select("reference, book_code, chapter, verse, translation_slug, last_read_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("user_achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const preferredSlug =
    profile?.preferred_translation_slug ?? DEFAULT_TRANSLATION_SLUG;
  const displayName = profile?.first_name ?? profile?.display_name ?? "Learner";

  return (
    <LearnerDashboard
      displayName={displayName}
      preferredSlug={preferredSlug}
      currentStreak={streak?.current_streak ?? 0}
      longestStreak={streak?.longest_streak ?? 0}
      xp={stats?.xp ?? 0}
      bibleIq={stats?.bible_iq ?? 0}
      masteryPercent={Number(stats?.mastery_percent ?? 0)}
      lessonsCompleted={stats?.lessons_completed ?? 0}
      bookmarkCount={bookmarkCount ?? 0}
      noteCount={noteCount ?? 0}
      achievementCount={achievementCount ?? 0}
      latestReference={latest?.reference ?? null}
      latestTranslationSlug={latest?.translation_slug ?? null}
    />
  );
}

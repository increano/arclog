import Link from "next/link";
import { requireUserOrRedirect } from "@/lib/supabase/auth";
import { getGuestAllowedLesson, getPathTree } from "@/lib/learning/queries";
import {
  Chip,
  DashboardCard,
  DashboardPageHeader,
} from "@/components/dashboard/ui";
import { Icon } from "@/components/ui/icon";

export default async function LessonsIndexPage() {
  await requireUserOrRedirect("/me/lessons");
  const [guestLesson, pathTree] = await Promise.all([
    getGuestAllowedLesson(),
    getPathTree("gospel-of-john"),
  ]);

  const lessons =
    pathTree?.lessons ??
    (guestLesson
      ? [
          {
            id: guestLesson.id,
            title: guestLesson.title,
            description: guestLesson.description,
            xp_reward: guestLesson.xp_reward,
            estimated_minutes: guestLesson.estimated_minutes,
          },
        ]
      : []);

  return (
    <div className="mx-auto w-full max-w-3xl px-margin-mobile pb-10 pt-4 md:px-10 md:pt-6">
      <DashboardPageHeader
        title="Lessons"
        subtitle="Interactive verse practice — read, recall, and scramble."
        action={<Chip tone="secondary" icon="quiz">Practice</Chip>}
      />

      {lessons.length === 0 ? (
        <DashboardCard>
          <p className="font-medium text-on-surface-variant">
            No published lessons yet. Seed the starter path, then refresh.
          </p>
        </DashboardCard>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Link key={lesson.id} href={`/me/lessons/${lesson.id}`}>
              <DashboardCard className="mb-3 flex items-center justify-between gap-4 transition-transform hover:scale-[1.01]">
                <div>
                  <h2 className="text-lg font-bold text-on-surface">{lesson.title}</h2>
                  {lesson.description ? (
                    <p className="mt-1 text-sm text-on-surface-variant">
                      {lesson.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs font-bold text-secondary">
                    +{lesson.xp_reward} XP
                    {lesson.estimated_minutes
                      ? ` · ${lesson.estimated_minutes} min`
                      : ""}
                  </p>
                </div>
                <Icon name="arrow_forward" className="text-primary" />
              </DashboardCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

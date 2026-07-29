import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { DashboardCard } from "@/components/dashboard/ui";

export function LessonUnavailableCard({
  title = "Lesson not ready",
  message = "This lesson exists, but it has no steps yet. Try another lesson or come back later.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-margin-mobile py-16 text-center">
      <DashboardCard className="w-full">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
          <Icon name="menu_book" className="text-3xl text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-on-surface">{title}</h1>
        <p className="mb-6 font-medium text-on-surface-variant">{message}</p>
        <Link
          href="/me/lessons"
          className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-bold text-on-primary"
        >
          Back to lessons
        </Link>
      </DashboardCard>
    </div>
  );
}

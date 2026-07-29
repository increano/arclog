import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import {
  Chip,
  DashboardCard,
  DashboardPageHeader,
  ProgressBar,
  StatTile,
} from "@/components/dashboard/ui";

export type ProfileAchievement = {
  id: string;
  title: string;
  description: string | null;
  unlockedAt: string;
};

export function ProfileView({
  displayName,
  preferredSlug,
  currentStreak,
  longestStreak,
  xp,
  bibleIq,
  masteryPercent,
  lessonsCompleted,
  bookmarkCount,
  noteCount,
  achievements,
}: {
  displayName: string;
  preferredSlug: string;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  bibleIq: number;
  masteryPercent: number;
  lessonsCompleted: number;
  bookmarkCount: number;
  noteCount: number;
  achievements: ProfileAchievement[];
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-margin-mobile pb-10 pt-4 md:px-10 md:pt-6">
      <DashboardPageHeader
        title="Profile & Milestones"
        subtitle={`Bible IQ, badges, and mastery for ${displayName}.`}
        action={<Chip tone="secondary" icon="person">Learner</Chip>}
      />

      <DashboardCard className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-on-primary">
          {displayName.slice(0, 1).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-on-surface">{displayName}</h2>
          <p className="font-medium text-on-surface-variant">
            Preferred translation · {preferredSlug}
          </p>
        </div>
        <div className="flex items-center gap-2 text-primary">
          <Icon name="local_fire_department" filled className="text-tertiary-fixed-dim" />
          <span className="text-sm font-bold">{currentStreak} day streak</span>
        </div>
      </DashboardCard>

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Bible IQ" value={String(bibleIq)} icon="psychology" />
        <StatTile
          label="Mastery"
          value={`${Math.round(masteryPercent)}%`}
          icon="school"
        />
        <StatTile label="Lessons" value={String(lessonsCompleted)} icon="task_alt" />
        <StatTile label="XP" value={String(xp)} icon="bolt" />
      </div>

      <DashboardCard className="mb-6">
        <ProgressBar
          value={masteryPercent}
          label="Overall mastery"
          detail={`${Math.round(masteryPercent)}%`}
        />
        <p className="mt-3 text-sm font-medium text-on-surface-variant">
          Longest streak: {longestStreak} days · Bookmarks: {bookmarkCount} · Notes:{" "}
          {noteCount}
        </p>
      </DashboardCard>

      <DashboardCard>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-on-surface">Unlocked Badges</h3>
          <Chip tone="tertiary" icon="stars">
            {achievements.length}
          </Chip>
        </div>
        {achievements.length === 0 ? (
          <p className="text-sm font-medium text-on-surface-variant">
            Complete lessons and keep your streak to unlock badges.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className="flex flex-col items-center gap-2 rounded-xl bg-surface-container-low p-4 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-tertiary-fixed-dim">
                  <Icon name="workspace_premium" filled className="text-3xl text-tertiary" />
                </div>
                <p className="text-sm font-bold text-on-surface">{a.title}</p>
                {a.description ? (
                  <p className="text-xs text-on-surface-variant">{a.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </DashboardCard>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/me"
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-on-primary"
        >
          Continue learning
        </Link>
        <Link
          href="/me/leaderboard"
          className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-outline-variant bg-surface px-5 text-sm font-bold text-primary"
        >
          View leaderboard
        </Link>
      </div>
    </div>
  );
}

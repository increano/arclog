import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { ProgressBar, StatTile } from "@/components/dashboard/ui";

type DashboardData = {
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
  achievementCount: number;
  latestReference: string | null;
  latestTranslationSlug: string | null;
  activeLessonHref?: string;
};

const PATH_NODES = [
  { title: "Creation", icon: "check_circle", state: "done" as const },
  {
    title: "The Fall",
    icon: "check_circle",
    state: "done" as const,
    offset: "-translate-x-12",
  },
  { title: "John 1", icon: "menu_book", state: "active" as const },
  {
    title: "Babel",
    icon: "lock",
    state: "locked" as const,
    offset: "translate-x-16",
  },
  { title: "Abraham", icon: "lock", state: "locked" as const },
];

function PathNode({
  title,
  icon,
  state,
  offset,
  href,
}: {
  title: string;
  icon: string;
  state: "done" | "active" | "locked";
  offset?: string;
  href?: string;
}) {
  const wrapperClass = offset ?? "";
  const stateClass =
    state === "done"
      ? "border-2 border-on-secondary-fixed-variant bg-secondary text-on-secondary"
      : state === "active"
        ? "border-2 border-on-primary-fixed-variant bg-primary text-on-primary ring-8 ring-primary-container/30"
        : "border-2 border-outline-variant bg-surface-container-lowest text-outline";

  const node = (
    <>
      <div
        className={`flex h-24 w-24 items-center justify-center rounded-full transition-transform hover:scale-105 ${stateClass} ${state === "active" ? "h-28 w-28" : ""}`}
      >
        <Icon
          name={icon}
          filled={state === "done"}
          className={state === "active" ? "text-5xl" : "text-4xl"}
        />
      </div>
      {state === "active" ? (
        <div className="mt-4 rounded-full bg-primary px-4 py-1 text-center text-sm font-bold text-on-primary">
          START: {title.toUpperCase()}
        </div>
      ) : (
        <div className="mt-3 text-center text-sm font-bold text-on-surface-variant">
          {title}
        </div>
      )}
    </>
  );

  return (
    <div className={`relative z-10 ${wrapperClass}`}>
      {href && state === "active" ? (
        <Link href={href} className="block text-center">
          {node}
        </Link>
      ) : (
        node
      )}
    </div>
  );
}

export function LearnerDashboard({
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
  achievementCount,
  latestReference,
  latestTranslationSlug,
  activeLessonHref = "/me/lessons",
}: DashboardData) {
  const goalMax = 500;

  return (
    <div className="flex w-full flex-col gap-8 px-margin-mobile pb-8 pt-4 md:px-10 md:pt-6 lg:flex-row lg:items-start">
      <main className="w-full lg:min-w-0 lg:flex-1">
        <div className="mx-auto max-w-xl">
          <div className="mb-12 text-center">
            <h1 className="mb-2 text-3xl font-bold text-on-background md:text-4xl">
              Welcome back, {displayName}
            </h1>
            <p className="font-medium italic text-on-surface-variant">
              Preferred translation: {preferredSlug}
            </p>
          </div>

          <div className="relative mb-12 flex flex-col items-center gap-12">
            <div className="pointer-events-none absolute bottom-12 top-12 z-0 w-2 bg-[repeating-linear-gradient(to_bottom,var(--color-outline-variant),var(--color-outline-variant)_10px,transparent_10px,transparent_20px)]" />
            {PATH_NODES.map((node) => (
              <PathNode
                key={node.title}
                {...node}
                href={node.state === "active" ? activeLessonHref : undefined}
              />
            ))}
          </div>
        </div>
      </main>

      <aside className="w-full lg:w-80 lg:shrink-0">
        <div className="space-y-4 lg:sticky lg:top-10">
          <section className="rounded-2xl border-2 border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-xl font-bold text-primary">Daily Reflection</h2>
            <p className="mb-3 text-xl leading-9 text-on-surface">
              {latestReference
                ? `Continue from ${latestReference}. Small, steady steps lead to deep understanding.`
                : `"Thy word is a lamp unto my feet, and a light unto my path."`}
            </p>
            <p className="text-sm font-bold text-on-surface-variant">
              {latestReference
                ? `${latestReference} · ${latestTranslationSlug ?? preferredSlug}`
                : "Psalm 119:105"}
            </p>
          </section>

          <section className="rounded-2xl border-2 border-outline-variant bg-surface-container-low p-5">
            <div className="mb-4 flex items-center gap-3">
              <Icon
                name="local_fire_department"
                filled
                className="text-3xl text-tertiary-fixed-dim"
              />
              <h3 className="text-xl font-bold text-on-surface">
                {currentStreak} Day Streak
              </h3>
            </div>
            <p className="text-sm font-medium text-on-surface-variant">
              Longest streak: {longestStreak} days
            </p>
          </section>

          <section className="rounded-2xl border-2 border-outline-variant bg-surface-container-high p-5">
            <ProgressBar
              value={xp}
              max={goalMax}
              label="Daily XP Goal"
              detail={`${xp} / ${goalMax}`}
            />
            <p className="mt-3 text-xs font-medium text-on-surface-variant">
              Keep going to hit today&apos;s study target.
            </p>
          </section>

          <div className="grid grid-cols-2 gap-4">
            <StatTile label="Bible IQ" value={String(bibleIq)} icon="psychology" />
            <StatTile
              label="Mastery"
              value={`${Math.round(masteryPercent)}%`}
              icon="school"
            />
            <StatTile
              label="Lessons"
              value={String(lessonsCompleted)}
              icon="task_alt"
            />
            <StatTile label="Badges" value={String(achievementCount)} icon="stars" />
          </div>

          <section className="rounded-2xl border-2 border-outline-variant bg-surface p-5">
            <h3 className="mb-4 text-lg font-bold text-on-surface">Quick Snapshot</h3>
            <div className="space-y-3 text-sm font-medium text-on-surface-variant">
              <div className="flex items-center justify-between gap-4">
                <span>Bookmarks</span>
                <span className="font-bold text-on-surface">{bookmarkCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Notes</span>
                <span className="font-bold text-on-surface">{noteCount}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>Total XP</span>
                <span className="font-bold text-on-surface">{xp}</span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}

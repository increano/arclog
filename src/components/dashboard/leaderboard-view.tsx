import { Icon } from "@/components/ui/icon";
import {
  Chip,
  DashboardCard,
  DashboardPageHeader,
  ProgressBar,
} from "@/components/dashboard/ui";

export type LeaderboardEntry = {
  userId: string;
  displayName: string;
  weeklyXp: number;
  isFriend?: boolean;
  isCurrentUser?: boolean;
};

export function LeaderboardView({
  leagueTitle,
  seasonLabel,
  entries,
  challengeProgress = 74,
}: {
  leagueTitle: string;
  seasonLabel: string;
  entries: LeaderboardEntry[];
  challengeProgress?: number;
}) {
  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div className="mx-auto w-full max-w-5xl px-margin-mobile pb-10 pt-4 md:px-10 md:pt-6">
      <DashboardPageHeader
        title={leagueTitle}
        subtitle={`${seasonLabel} · Keep climbing to advance.`}
        action={
          <Chip tone="primary" icon="emoji_events">
            League Ranking
          </Chip>
        }
      />

      <DashboardCard className="mb-6 overflow-hidden">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="flex h-40 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 via-secondary-container/40 to-tertiary-fixed md:w-1/3">
            <Icon name="route" className="text-6xl text-primary" />
          </div>
          <div className="flex-1">
            <p className="mb-1 flex items-center gap-1 text-sm font-bold text-secondary">
              <Icon name="group" className="text-base" />
              COMMUNITY CHALLENGE
            </p>
            <h2 className="mb-2 text-2xl font-bold text-on-surface md:text-3xl">
              The Romans Roadmap
            </h2>
            <p className="mb-4 font-medium text-on-surface-variant">
              Our community is reading through Romans together. Join the journey
              and help reach the collective goal.
            </p>
            <ProgressBar
              value={challengeProgress}
              label="Group Progress"
              detail={`${challengeProgress}% Complete`}
            />
          </div>
        </div>
      </DashboardCard>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {podium.map((entry, index) => {
          const rank = index + 1;
          const isFirst = rank === 1;
          return (
            <DashboardCard
              key={entry.userId}
              highlight={isFirst}
              className={`flex flex-col items-center text-center ${
                isFirst ? "bg-primary-container text-on-primary-container md:scale-105" : ""
              } ${rank === 2 ? "md:order-first" : ""}`}
            >
              <div className="relative mb-4">
                <div
                  className={`flex items-center justify-center rounded-full border-4 font-bold ${
                    isFirst
                      ? "h-28 w-28 border-tertiary-fixed-dim bg-primary text-3xl text-on-primary"
                      : "h-20 w-20 border-outline-variant bg-surface-container text-xl text-primary"
                  }`}
                >
                  {entry.displayName.slice(0, 1).toUpperCase()}
                </div>
                <span
                  className={`absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    rank === 1
                      ? "bg-tertiary-fixed-dim text-on-tertiary-fixed"
                      : "bg-outline-variant text-on-surface"
                  }`}
                >
                  {rank}
                </span>
              </div>
              <h3 className={`text-lg font-bold ${isFirst ? "text-white" : "text-on-surface"}`}>
                {entry.isCurrentUser ? "You" : entry.displayName}
              </h3>
              <p
                className={`mb-4 text-sm font-bold ${
                  isFirst ? "text-primary-fixed" : "text-on-surface-variant"
                }`}
              >
                {entry.weeklyXp.toLocaleString()} XP
              </p>
            </DashboardCard>
          );
        })}
      </div>

      <div className="mb-2 flex items-center justify-between px-2 text-xs font-bold tracking-wider text-outline uppercase">
        <span>Rank &amp; Name</span>
        <span>Weekly XP</span>
      </div>
      <div className="space-y-3">
        {rest.map((entry, i) => (
          <DashboardCard
            key={entry.userId}
            highlight={entry.isCurrentUser}
            className="flex items-center justify-between py-3"
          >
            <div className="flex items-center gap-4">
              <span className="w-6 text-center font-bold text-on-surface-variant">
                {i + 4}
              </span>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                  entry.isCurrentUser
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container text-primary"
                }`}
              >
                {entry.isCurrentUser
                  ? "ME"
                  : entry.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  {entry.isCurrentUser ? "You" : entry.displayName}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {entry.isFriend ? "Friend" : entry.isCurrentUser ? leagueTitle : "Learner"}
                </p>
              </div>
            </div>
            <span className="text-sm font-bold text-on-surface">
              {entry.weeklyXp.toLocaleString()} XP
            </span>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}

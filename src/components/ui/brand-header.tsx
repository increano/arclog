import Link from "next/link";
import { Icon } from "@/components/ui/icon";

type BrandHeaderProps = {
  showStreak?: boolean;
  showLanguage?: boolean;
  closeHref?: string;
};

export function BrandHeader({
  showStreak = false,
  showLanguage = true,
  closeHref,
}: BrandHeaderProps) {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b-2 border-outline-variant bg-surface px-margin-mobile md:px-10">
      <div className="flex items-center gap-3">
        {closeHref ? (
          <Link
            href={closeHref}
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-container-low active:scale-90"
            aria-label="Close"
          >
            <Icon name="close" className="text-on-surface" />
          </Link>
        ) : (
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-primary"
          >
            Arclog
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showStreak ? (
          <div className="flex items-center gap-1 px-2 text-primary">
            <Icon name="local_fire_department" filled className="text-tertiary-fixed-dim" />
            <span className="text-sm font-bold text-on-surface">1 Day Streak</span>
          </div>
        ) : null}
        {showLanguage ? (
          <button
            type="button"
            className="rounded-full p-2 text-primary hover:bg-surface-container-low"
            aria-label="Language"
          >
            <Icon name="language" />
          </button>
        ) : null}
      </div>
    </header>
  );
}

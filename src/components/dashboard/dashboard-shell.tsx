"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { ProfileMenu } from "@/components/dashboard/profile-menu";

const NAV_ITEMS = [
  { label: "Home", icon: "home", href: "/me", active: true },
  { label: "Library", icon: "menu_book", href: null, active: false },
  { label: "Leaderboard", icon: "leaderboard", href: null, active: false },
] as const;

function NavItem({
  label,
  icon,
  href,
  active,
  mobile = false,
}: {
  label: string;
  icon: string;
  href: string | null;
  active: boolean;
  mobile?: boolean;
}) {
  const baseClass = mobile
    ? "flex flex-col items-center justify-center rounded-full px-6 py-2 text-[10px] font-bold transition-transform duration-150 active:scale-90"
    : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-transform active:translate-y-0.5";

  const activeClass = mobile
    ? "bg-secondary-container text-on-secondary-container"
    : "border-b-4 border-primary bg-primary-container text-on-primary-container";

  const idleClass = mobile
    ? "text-outline"
    : "text-on-surface-variant hover:bg-surface-container-high";

  const content = (
    <>
      <Icon name={icon} filled={active} />
      <span>{label}</span>
    </>
  );

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${baseClass} ${idleClass} cursor-default opacity-70`}
      >
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={`${baseClass} ${active ? activeClass : idleClass}`}>
      {content}
    </Link>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-full bg-background text-on-background">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b-2 border-outline-variant bg-surface px-margin-mobile md:left-64 md:border-b-2 md:px-10">
        <Link
          href="/me"
          className="text-2xl font-bold tracking-tight text-primary md:invisible"
        >
          Arclog
        </Link>
        <div className="flex items-center gap-3">
          <Icon
            name="local_fire_department"
            filled
            className="text-tertiary-fixed-dim md:hidden"
          />
          <ProfileMenu />
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col gap-4 border-r-2 border-outline-variant bg-surface p-6 md:flex">
        <div className="mb-4">
          <Link href="/me" className="text-3xl font-bold tracking-tight text-primary">
            Arclog
          </Link>
        </div>

        <nav className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              label={item.label}
              icon={item.icon}
              href={item.href}
              active={item.active && pathname === "/me"}
            />
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border-2 border-outline-variant bg-surface-container p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container">
              <Icon name="auto_stories" className="text-on-secondary-container" />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Faith Journey</p>
              <p className="text-xs font-medium text-on-surface-variant">
                Learner dashboard
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-on-surface-variant">
            This is your dedicated study space.
          </p>
        </div>
      </aside>

      <div className="flex min-h-full flex-col pb-20 pt-16 md:ml-64 md:pb-0">
        {children}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around border-t-2 border-outline-variant bg-surface px-4 pb-4 pt-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavItem
            key={item.label}
            label={item.label}
            icon={item.icon}
            href={item.href}
            active={item.active && pathname === "/me"}
            mobile
          />
        ))}
      </nav>
    </div>
  );
}

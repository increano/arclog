import Link from "next/link";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/data-sources", label: "Data Sources" },
  { href: "/terms", label: "Terms" },
  { href: "/policy", label: "Policy" },
  { href: "/contact", label: "Contact" },
] as const;

export function Footer() {
  return (
    <footer className="border-t-2 border-outline-variant bg-surface px-margin-mobile py-6 md:px-10">
      <div className="flex w-full flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-on-surface-variant">
          © {new Date().getFullYear()} Arclog
        </p>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-on-surface-variant hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

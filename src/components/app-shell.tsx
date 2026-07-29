"use client";

import { usePathname } from "next/navigation";
import { BrandHeader } from "@/components/ui/brand-header";
import { Footer } from "@/components/ui/footer";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

function isDashboardPath(pathname: string | null) {
  return pathname === "/me" || pathname?.startsWith("/me/") === true;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isDashboardPath(pathname)) {
    return <DashboardShell>{children}</DashboardShell>;
  }

  return (
    <>
      <BrandHeader />
      <div className="flex-grow pt-16">{children}</div>
      <Footer />
    </>
  );
}

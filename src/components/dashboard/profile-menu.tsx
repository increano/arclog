"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { signOut } from "@/lib/actions/auth";

export function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-primary hover:bg-surface-container-low"
        aria-label="Profile"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Icon name="account_circle" className="text-3xl" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border-2 border-outline-variant bg-surface-container-lowest shadow-lg"
        >
          <form action={signOut}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              <Icon name="logout" />
              Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

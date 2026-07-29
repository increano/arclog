"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

const LANGUAGES = [
  {
    code: "EN",
    label: "English",
  },
] as const;

type LanguageCode = (typeof LANGUAGES)[number]["code"];

export function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<LanguageCode>("EN");
  const rootRef = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((lang) => lang.code === selected) ?? LANGUAGES[0];

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
        className="flex items-center gap-1.5 rounded-full px-2 py-2 text-primary"
        aria-label="Language"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-sm text-on-surface-variant">Language&nbsp;:</span>
        <span className="text-sm font-bold text-on-surface">
          {current.code}
        </span>
        <Icon
          name="expand_more"
          className={`text-xl transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border-2 border-outline-variant bg-surface-container-lowest shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = lang.code === selected;
            return (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelected(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  isSelected
                    ? "bg-surface-container text-on-surface"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="text-sm font-bold">{lang.code}</span>
                <span className="text-sm">{lang.label}</span>
                {isSelected ? (
                  <Icon
                    name="check"
                    className="ml-auto text-secondary"
                    filled
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

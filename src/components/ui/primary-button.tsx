import { Icon } from "@/components/ui/icon";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  showArrow?: boolean;
};

export function PrimaryButton({
  children,
  showArrow = false,
  className = "",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`btn-primary-tactile group flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-lg font-bold text-on-primary disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
      {showArrow ? (
        <Icon
          name="arrow_forward"
          className="transition-transform group-hover:translate-x-1"
        />
      ) : null}
    </button>
  );
}


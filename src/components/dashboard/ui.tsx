import { Icon } from "@/components/ui/icon";

export function DashboardPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">{title}</h1>
        {subtitle ? (
          <p className="mt-1 font-medium text-on-surface-variant">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function DashboardCard({
  children,
  className = "",
  highlight = false,
}: {
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 bg-surface-container-lowest p-5 ${
        highlight
          ? "border-primary ring-2 ring-primary/20"
          : "border-outline-variant"
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  label,
  detail,
}: {
  value: number;
  max?: number;
  label?: string;
  detail?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(max, 1)) * 100));
  return (
    <div>
      {(label || detail) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs font-bold">
          {label ? <span className="text-on-surface">{label}</span> : <span />}
          {detail ? <span className="text-secondary">{detail}</span> : null}
        </div>
      )}
      <div className="h-4 overflow-hidden rounded-full bg-surface-dim">
        <div
          className="h-full rounded-full bg-secondary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function Chip({
  children,
  tone = "neutral",
  icon,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "primary" | "secondary" | "tertiary";
  icon?: string;
}) {
  const tones = {
    neutral: "bg-surface-container text-on-surface-variant",
    primary: "bg-primary-fixed text-on-primary-fixed",
    secondary: "bg-secondary-container/40 text-on-secondary-container",
    tertiary: "bg-tertiary-fixed text-on-tertiary-fixed",
  } as const;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${tones[tone]}`}
    >
      {icon ? <Icon name={icon} className="text-sm" filled /> : null}
      {children}
    </span>
  );
}

export function ScriptureCard({
  text,
  reference,
  translationLabel,
  accent = "primary",
}: {
  text: string;
  reference?: string;
  translationLabel?: string;
  accent?: "primary" | "secondary" | "tertiary";
}) {
  const border =
    accent === "secondary"
      ? "border-secondary"
      : accent === "tertiary"
        ? "border-tertiary"
        : "border-primary";

  return (
    <DashboardCard className="flex flex-col gap-4">
      {translationLabel ? (
        <span
          className={`w-fit rounded-lg px-3 py-1 text-xs font-bold tracking-widest ${
            accent === "secondary"
              ? "bg-secondary-container/30 text-secondary"
              : "bg-primary-container/10 text-primary"
          }`}
        >
          {translationLabel}
        </span>
      ) : null}
      <div className={`rounded-2xl border-2 bg-surface-container-low p-5 ${border}`}>
        <p className="text-xl italic leading-9 text-on-surface">{`"${text}"`}</p>
      </div>
      {reference ? (
        <p className="text-sm font-bold text-on-surface-variant">{reference}</p>
      ) : null}
    </DashboardCard>
  );
}

export function StatTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: string;
}) {
  return (
    <DashboardCard>
      <div className="mb-2 flex items-center gap-2 text-primary">
        <Icon name={icon} />
        <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold text-on-surface">{value}</p>
    </DashboardCard>
  );
}

type OnboardingProgressProps = {
  step: number;
  total?: number;
  label: string;
};

export function OnboardingProgress({
  step,
  total = 3,
  label,
}: OnboardingProgressProps) {
  const pct = Math.min(100, Math.round((step / total) * 100));
  return (
    <div className="mb-10 w-full max-w-md">
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-surface-container">
        <div
          className="relative h-full rounded-full bg-secondary transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        >
          <div className="progress-liquid absolute inset-0" />
        </div>
      </div>
      <div className="mt-2 flex w-full items-center justify-between gap-4">
        <span className="shrink-0 text-sm font-bold text-on-surface-variant">
          Step {step} of {total}
        </span>
        <span className="text-right text-sm font-bold text-secondary">{label}</span>
      </div>
    </div>
  );
}

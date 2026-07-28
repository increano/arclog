import { Icon } from "@/components/ui/icon";

export type OptionItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  filled?: boolean;
};

type OptionCardGridProps = {
  options: OptionItem[];
  value: string | null;
  onChange: (id: string) => void;
  columns?: 1 | 2;
};

export function OptionCardGrid({
  options,
  value,
  onChange,
  columns = 2,
}: OptionCardGridProps) {
  return (
    <div
      className={`grid w-full max-w-2xl gap-gutter ${
        columns === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
      }`}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            data-active={active}
            onClick={() => onChange(opt.id)}
            className="option-card group flex cursor-pointer items-center gap-6 rounded-xl border-2 border-outline-variant bg-surface-container-lowest p-6 text-left hover:border-primary"
          >
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                active ? "bg-primary-container" : "bg-surface-container"
              }`}
            >
              <Icon
                name={opt.icon}
                filled={opt.filled ?? active}
                className={`text-4xl ${
                  active ? "text-on-primary-container" : "text-primary"
                }`}
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-on-background">{opt.title}</h3>
              <p className="text-on-surface-variant">{opt.subtitle}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

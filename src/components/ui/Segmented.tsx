type Option<T extends string> = {
  value: T;
  label: string;
  /** Extra classes for this option while it is NOT selected (e.g. a warning text color). */
  idleClassName?: string;
};

type Tone = "primary" | "ink";

const SELECTED: Record<Tone, string> = {
  primary: "bg-primary text-white shadow-sm",
  ink: "bg-ink text-white shadow-sm",
};

/**
 * A segmented control: one choice out of a few, shown side by side. Real
 * buttons with `aria-pressed` inside a labelled group, each at least 40px
 * tall. Replaces the rows of gradient filter pills, where two unrelated
 * filters looked like one long list.
 */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  tone = "primary",
}: {
  /** Accessible name of the group (not shown). */
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  tone?: Tone;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-field border border-border bg-canvas p-1">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={`min-h-10 rounded-[10px] px-3.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              selected ? SELECTED[tone] : `text-ink-muted hover:bg-card hover:text-ink ${option.idleClassName ?? ""}`
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

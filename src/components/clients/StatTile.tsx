import type { ComponentType } from "react";

type Tone = "primary" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, { chip: string; glow: string }> = {
  primary: { chip: "bg-mkt-mint-bg text-mkt-teal-deep", glow: "bg-mkt-mint/15" },
  success: { chip: "bg-status-on-track-bg text-status-on-track", glow: "bg-status-on-track/10" },
  warning: { chip: "bg-status-attention-bg text-status-attention", glow: "bg-status-attention/10" },
  danger: { chip: "bg-status-late-bg text-status-late", glow: "bg-status-late/10" },
};

/**
 * dashboard-builder Step 2: icon inside a tinted chip (icon + tint drawn
 * from the SAME semantic token, never independently chosen colors), a
 * large tabular-figures number, and a short label. Styled after the
 * landing page's feature cards — soft corner glow in the tone color,
 * lift on hover.
 */
export function StatTile({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number }>;
  value: number;
  label: string;
  tone: Tone;
}) {
  const classes = TONE_CLASSES[tone];

  return (
    <div className="group relative flex flex-col gap-4 overflow-hidden rounded-panel border border-border/70 bg-card p-5 shadow-panel transition-all hover:-translate-y-0.5 hover:shadow-panel-hover">
      <div
        className={`pointer-events-none absolute -top-10 -end-10 h-28 w-28 rounded-full blur-2xl ${classes.glow}`}
        aria-hidden="true"
      />
      <div className={`relative flex h-11 w-11 items-center justify-center rounded-[12px] ${classes.chip}`}>
        <Icon size={21} strokeWidth={1.9} />
      </div>
      <div className="relative flex flex-col gap-0.5">
        <span className="text-[28px] font-extrabold leading-none tabular-nums text-ink">{value}</span>
        <span className="text-sm font-medium text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

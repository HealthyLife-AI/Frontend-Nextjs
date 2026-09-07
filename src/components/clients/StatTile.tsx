import type { ComponentType } from "react";

type Tone = "primary" | "success" | "warning" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-status-on-track-bg text-status-on-track",
  warning: "bg-status-attention-bg text-status-attention",
  danger: "bg-status-late-bg text-status-late",
};

/**
 * dashboard-builder Step 2: icon inside a tinted badge (icon + tint drawn
 * from the SAME semantic token, never independently chosen colors), a
 * large tabular-figures number, and a short label.
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
  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-card p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${TONE_CLASSES[tone]}`}>
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-semibold tabular-nums text-ink">{value}</span>
        <span className="text-xs text-ink-muted">{label}</span>
      </div>
    </div>
  );
}

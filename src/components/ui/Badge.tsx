import { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "danger" | "neutral" | "primary";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-status-on-track-bg text-status-on-track-ink",
  warning: "bg-status-attention-bg text-status-attention-ink",
  danger: "bg-status-late-bg text-status-late-ink",
  neutral: "bg-ink-muted/10 text-ink-muted",
  primary: "bg-primary/10 text-primary",
};

/**
 * Status is never color alone (dashboard-builder): every badge pairs its
 * tint with a leading dot + text label, so a color-blind reader (or a
 * grayscale screenshot) can still tell states apart. The tinted tones use
 * the `*-ink` text colors: the plain status colors are 2-3.3:1 on their
 * own tints, below WCAG AA.
 */
export function Badge({ tone, children }: { tone: BadgeTone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${TONE_CLASSES[tone]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

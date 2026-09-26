import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = "primary",
  pill = false,
}: {
  eyebrow: string;
  /** A plain string for most sections; `t.rich(...)` output (patient-app) for a partial-color headline. */
  title: ReactNode;
  subtitle: string;
  tone?: "primary" | "accent";
  /**
   * Figma's eyebrow treatment differs by section, not an oversight:
   * - `"dotted"` — a bordered mint pill with a trailing dot
   *   (patient-app).
   * - `"plain"` — an unbordered sky-tint pill, no dot; the same chip
   *   `Hero`'s badge uses (how-it-works, why-healthylife).
   * - `false` (default) — a plain uppercase tracked label.
   *
   * FAQ has its own fourth treatment (a bordered pill with *no* dot,
   * right-aligned instead of centered) on a two-column layout this
   * component doesn't fit — `FaqSection` builds its heading directly
   * rather than routing that one-off shape through here.
   */
  pill?: boolean | "dotted" | "plain";
}) {
  const pillStyle = pill === true ? "dotted" : pill;

  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center">
      {pillStyle === "dotted" ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-4 py-1.5 text-sm font-semibold text-mkt-emerald-deep">
          {eyebrow}
          <span className="h-2 w-2 rounded-full bg-mkt-mint" />
        </span>
      ) : pillStyle === "plain" ? (
        <span className="inline-flex min-h-[46px] items-center rounded-[8px] bg-mkt-sky/20 px-[13px] py-2 text-[13px] font-medium text-mkt-teal-deep">
          {eyebrow}
        </span>
      ) : (
        <span
          className={`text-sm font-bold uppercase tracking-wider ${
            tone === "accent" ? "text-accent-active" : "text-primary"
          }`}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
      <p className="mt-3 text-ink-muted">{subtitle}</p>
    </Reveal>
  );
}

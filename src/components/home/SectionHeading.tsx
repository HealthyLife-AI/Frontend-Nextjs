import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * One heading treatment for every homepage section: a mint eyebrow pill
 * with a live dot, a large balanced display title, and a muted lede.
 * Sections that need a partial-color title pass `t.rich(...)` output.
 *
 * `tone="dark"` is the inverse for the deep-teal bands (principles,
 * closing CTA).
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  tone = "light",
  className = "",
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "start";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <Reveal
      className={`${align === "center" ? "mx-auto text-center" : "text-start"} mb-14 max-w-3xl lg:mb-20 ${className}`}
    >
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${
          dark
            ? "border-white/15 bg-white/[0.06] text-mkt-glow"
            : "border-mkt-mint-border bg-mkt-mint-bg text-mkt-emerald-deep"
        }`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full ${dark ? "bg-mkt-glow" : "bg-mkt-mint"} animate-pulse-ring`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dark ? "bg-mkt-glow" : "bg-mkt-mint"}`} />
        </span>
        {eyebrow}
      </span>

      <h2
        className={`mt-5 text-balance text-3xl font-extrabold leading-[1.2] sm:text-4xl lg:text-[44px] lg:leading-[1.15] ltr:tracking-tight ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {title}
      </h2>

      {subtitle ? (
        <p className={`mt-4 text-pretty text-base leading-relaxed sm:text-lg ${dark ? "text-mkt-dark-muted" : "text-ink-muted"}`}>
          {subtitle}
        </p>
      ) : null}
    </Reveal>
  );
}

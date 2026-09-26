import type { ReactNode } from "react";

/**
 * Page title block shared by every dashboard screen: a small tinted
 * eyebrow chip (the landing page's section-eyebrow language), a bold
 * headline, a muted subtitle, and an optional actions slot aligned to the
 * inline-end edge. One component so the screens can't drift into eight
 * slightly different heading styles again.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 flex-col gap-2">
        {eyebrow && (
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-mkt-mint-border/70 bg-mkt-mint-bg px-3 py-1 text-xs font-bold text-mkt-emerald-deep">
            <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" aria-hidden="true" />
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-extrabold leading-tight text-ink sm:text-[28px]">{title}</h1>
        {subtitle && <p className="max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-[15px]">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

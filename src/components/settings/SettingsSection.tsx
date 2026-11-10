import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * One card on the settings page: a 40px tinted icon, the section title and
 * a one-line description, the body, and an optional footer with a status on
 * the start side and an action on the end side. The id is the anchor the
 * section nav links to; html's `scroll-padding-top` (globals.css) keeps the
 * title clear of the fixed header when it scrolls into view.
 */
export function SettingsSection({
  id,
  icon: Icon,
  title,
  description,
  footerStatus,
  footerAction,
  footerRef,
  children,
}: {
  id: string;
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  footerStatus?: ReactNode;
  footerAction?: ReactNode;
  /** Lets the page notice when the footer scrolls out of view. */
  footerRef?: React.Ref<HTMLDivElement>;
  children?: ReactNode;
}) {
  const headingId = `${id}-title`;

  return (
    <section id={id} aria-labelledby={headingId} className="rounded-panel border border-border/70 bg-card px-6 py-[22px] shadow-panel">
      <div className={`flex items-start gap-3.5 ${children ? "mb-4" : ""}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 id={headingId} className="text-lg font-extrabold leading-snug text-ink">
            {title}
          </h2>
          {description && <p className="text-sm text-ink-muted">{description}</p>}
        </div>
      </div>

      {children}

      {(footerStatus || footerAction) && (
        <div ref={footerRef} className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-divider pt-4">
          <div className="min-w-0 text-sm">{footerStatus}</div>
          {footerAction}
        </div>
      )}
    </section>
  );
}

import type { LucideIcon } from "lucide-react";

/** Icon tile + title + subtitle shared by every auth screen. */
export function AuthHeading({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-3 text-start">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <div className="flex flex-col gap-1.5">
        <h1 className="text-balance text-[26px] font-extrabold leading-tight text-ink sm:text-[28px] ltr:tracking-tight">{title}</h1>
        <p className="text-pretty text-sm leading-relaxed text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}

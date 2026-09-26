"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const labels: Record<string, string> = { ar: "العربية", en: "English" };

/** Swaps locale on the current path — used to QA both directions quickly. */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-0.5 rounded-full border border-border bg-card p-1 text-xs">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-full px-3 py-1.5 font-semibold transition-colors ${
            l === locale
              ? "bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand"
              : "text-ink-muted hover:text-mkt-teal-deep"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

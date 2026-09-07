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
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          className={`rounded-control px-2.5 py-1 transition-colors ${
            l === locale
              ? "bg-primary/10 font-medium text-primary"
              : "text-ink-muted hover:bg-ink-muted/10 hover:text-ink"
          }`}
          aria-current={l === locale ? "true" : undefined}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}

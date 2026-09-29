import type { ReactNode } from "react";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

/**
 * Shell for the public information pages (privacy policy, account
 * deletion): a slim top bar with the logo and the language switch, one
 * readable column, a small footer. Deliberately not the homepage header —
 * its links are in-page anchors (`#faq`) that mean nothing off the
 * homepage. Logical properties only, so it lays out the same in both
 * directions.
 *
 * `draft` puts a prominent notice above the content for pages whose text
 * is a placeholder (the privacy policy, until the real text is provided).
 */
export async function LegalPage({
  title,
  intro,
  draft = false,
  children,
}: {
  title: string;
  intro?: string;
  draft?: boolean;
  children: ReactNode;
}) {
  const t = await getTranslations("legal.shell");
  const tCommon = await getTranslations("common");
  const year = new Date().getFullYear();

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="border-b border-border/70 bg-card/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            <Image src="/home/logo.png" alt={tCommon("brandFull")} width={112} height={56} priority className="h-auto w-24" />
          </Link>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {draft && (
          <div role="note" className="mb-8 flex items-start gap-3 rounded-panel border border-status-attention/30 bg-status-attention-bg p-4">
            <TriangleAlert size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-status-attention" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-ink">{t("draftTitle")}</p>
              <p className="mt-0.5 text-sm text-ink-muted">{t("draftBody")}</p>
            </div>
          </div>
        )}

        <h1 className="text-balance text-3xl font-extrabold leading-tight text-ink sm:text-4xl">{title}</h1>
        {intro && <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-muted">{intro}</p>}

        <div className="mt-10 flex flex-col gap-8">{children}</div>
      </main>

      <footer className="border-t border-divider bg-card">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-ink-muted sm:flex-row sm:px-6">
          <span>{t("copyright", { year })}</span>
          <Link href="/" className="font-semibold text-mkt-teal-deep hover:text-primary">
            {t("backHome")}
          </Link>
        </div>
      </footer>
    </div>
  );
}

/** One titled block of a legal page. */
export function LegalSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-bold text-ink">{heading}</h2>
      <div className="mt-2 text-pretty leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}

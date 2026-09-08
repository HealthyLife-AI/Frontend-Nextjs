import { BadgeCheck, Mail } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Reveal } from "./Reveal";

export async function CtaSection() {
  const t = await getTranslations("home.cta");
  const tFooter = await getTranslations("home.footer");

  return (
    <section id="book-demo" className="relative overflow-hidden bg-ink px-4 py-24 text-card sm:px-6 lg:px-8">
      <div
        className="pointer-events-none absolute -bottom-20 end-[-5rem] h-80 w-80 rounded-full bg-accent/15 blur-3xl"
        aria-hidden="true"
      />

      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-card/10 px-3.5 py-1.5 text-sm text-accent">
          <BadgeCheck size={16} strokeWidth={1.75} />
          {t("badge")}
        </div>

        <h2 className="mb-4 max-w-xl text-3xl font-bold leading-snug sm:text-4xl">{t("title")}</h2>
        <p className="mb-10 max-w-xl text-lg text-card/75">{t("subtitle")}</p>

        <Link href="/register">
          <Button className="!h-12 !px-8 !text-base">{t("button")}</Button>
        </Link>

        <div className="mt-8 flex items-center gap-2 text-sm text-card/70">
          <Mail size={16} strokeWidth={1.75} className="text-accent" />
          <span>
            {t("contactPrompt")} <strong className="font-semibold text-card">{tFooter("email")}</strong>
          </span>
        </div>
      </Reveal>
    </section>
  );
}

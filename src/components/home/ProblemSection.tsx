import { FileSpreadsheet, MessageCircle, BellOff } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const CARDS = [
  { icon: MessageCircle, titleKey: "card1Title", bodyKey: "card1Body" },
  { icon: FileSpreadsheet, titleKey: "card2Title", bodyKey: "card2Body" },
  { icon: BellOff, titleKey: "card3Title", bodyKey: "card3Body" },
] as const;

export async function ProblemSection() {
  const t = await getTranslations("home.problem");

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map(({ icon: Icon, titleKey, bodyKey }, i) => (
            <Reveal key={titleKey} delayMs={i * 100}>
              <div className="flex h-full flex-col rounded-card border border-border bg-card p-6 text-start shadow-card transition-shadow hover:shadow-card-hover">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-control bg-primary/10 text-primary">
                  <Icon size={26} strokeWidth={1.75} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{t(titleKey)}</h3>
                <p className="leading-relaxed text-ink-muted">{t(bodyKey)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

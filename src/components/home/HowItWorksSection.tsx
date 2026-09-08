import { BrainCircuit, SlidersHorizontal, UserPlus, BadgeCheck, Zap, BellRing, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS: {
  icon: LucideIcon;
  numberKey: "step1Number" | "step2Number" | "step3Number";
  titleKey: "step1Title" | "step2Title" | "step3Title";
  bodyKey: "step1Body" | "step2Body" | "step3Body";
  noteKey: "step1Note" | "step2Note" | "step3Note";
  noteIcon: LucideIcon;
  tileClass: string;
}[] = [
  {
    icon: UserPlus,
    numberKey: "step1Number",
    titleKey: "step1Title",
    bodyKey: "step1Body",
    noteKey: "step1Note",
    noteIcon: BadgeCheck,
    tileClass: "bg-primary/10 text-primary",
  },
  {
    icon: SlidersHorizontal,
    numberKey: "step2Number",
    titleKey: "step2Title",
    bodyKey: "step2Body",
    noteKey: "step2Note",
    noteIcon: Zap,
    tileClass: "bg-accent/15 text-accent-active",
  },
  {
    icon: BrainCircuit,
    numberKey: "step3Number",
    titleKey: "step3Title",
    bodyKey: "step3Body",
    noteKey: "step3Note",
    noteIcon: BellRing,
    tileClass: "bg-status-attention-bg text-status-attention",
  },
];

export async function HowItWorksSection() {
  const t = await getTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="bg-card/60 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} tone="accent" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, numberKey, titleKey, bodyKey, noteKey, noteIcon: NoteIcon, tileClass }, i) => (
            <Reveal key={titleKey} delayMs={i * 100}>
              <div className="flex h-full flex-col rounded-card border border-border bg-card p-6 text-start shadow-card">
                <div className="mb-5 flex items-center justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-control ${tileClass}`}>
                    <Icon size={24} strokeWidth={1.75} />
                  </div>
                  <span className="text-3xl font-bold text-border">{t(numberKey)}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-ink">{t(titleKey)}</h3>
                <p className="leading-relaxed text-ink-muted">{t(bodyKey)}</p>
                <div className="mt-4 flex items-center gap-2 rounded-control bg-canvas px-3 py-2.5 text-sm text-ink-muted">
                  <NoteIcon size={17} strokeWidth={1.75} className="text-accent-active" />
                  <span>{t(noteKey)}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

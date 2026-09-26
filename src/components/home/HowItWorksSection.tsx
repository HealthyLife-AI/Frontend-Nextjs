import { BrainCircuit, SlidersHorizontal, UserPlus, BadgeCheck, Zap, BellRing, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { HowItWorksMockup } from "./HowItWorksMockup";

/**
 * Card visuals measured off the Figma export (`design-reference/SVG for
 * image design/Desktop - 1.svg`, node 49:3, y 1708-1976): each card gets
 * its own near-white tint, a solid-fill icon tile (white glyph, not this
 * app's usual light-tint-square/colored-icon), and a big background
 * number tinted a pale version of that same icon color — not the flat
 * `text-border` gray this section used before.
 */
const STEPS: {
  icon: LucideIcon;
  numberKey: "step1Number" | "step2Number" | "step3Number";
  titleKey: "step1Title" | "step2Title" | "step3Title";
  bodyKey: "step1Body" | "step2Body" | "step3Body";
  noteKey: "step1Note" | "step2Note" | "step3Note";
  noteIcon: LucideIcon;
  cardBg: string;
  tileClass: string;
  numberClass: string;
}[] = [
  {
    icon: UserPlus,
    numberKey: "step1Number",
    titleKey: "step1Title",
    bodyKey: "step1Body",
    noteKey: "step1Note",
    noteIcon: BadgeCheck,
    cardBg: "bg-[#F4FEFF]",
    tileClass: "bg-primary text-white",
    numberClass: "text-mkt-teal-pale",
  },
  {
    icon: SlidersHorizontal,
    numberKey: "step2Number",
    titleKey: "step2Title",
    bodyKey: "step2Body",
    noteKey: "step2Note",
    noteIcon: Zap,
    cardBg: "bg-[#F9FFFE]",
    tileClass: "bg-mkt-jade text-white",
    numberClass: "text-mkt-mint-pale",
  },
  {
    icon: BrainCircuit,
    numberKey: "step3Number",
    titleKey: "step3Title",
    bodyKey: "step3Body",
    noteKey: "step3Note",
    noteIcon: BellRing,
    cardBg: "bg-[#FFFCF8]",
    tileClass: "bg-mkt-amber text-white",
    numberClass: "text-mkt-amber-pale",
  },
];

export async function HowItWorksSection() {
  const t = await getTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="bg-card/60 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <HowItWorksMockup />
        </Reveal>

        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} pill="plain" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(
            ({ icon: Icon, numberKey, titleKey, bodyKey, noteKey, noteIcon: NoteIcon, cardBg, tileClass, numberClass }, i) => (
              <Reveal key={titleKey} delayMs={i * 100}>
                <div className={`flex h-full flex-col rounded-card ${cardBg} p-6 text-start`}>
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tileClass}`}>
                      <Icon size={24} strokeWidth={1.75} />
                    </div>
                    <span className={`text-3xl font-bold ${numberClass}`}>{t(numberKey)}</span>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-ink">{t(titleKey)}</h3>
                  <p className="leading-relaxed text-ink-muted">{t(bodyKey)}</p>
                  <div className="mt-4 flex items-center gap-2 rounded-control bg-canvas px-3 py-2.5 text-sm text-ink-muted">
                    <NoteIcon size={17} strokeWidth={1.75} className="text-accent-active" />
                    <span>{t(noteKey)}</span>
                  </div>
                </div>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
}

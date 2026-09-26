import Image from "next/image";
import { Heart, LineChart, PieChart, Shield, Star, Users, Zap, type LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

/**
 * Figma's "لماذا HealthyLife؟" section (`Desktop - 1.svg`, y 3285-4244)
 * is one flattened 1536x1024 raster (`image6_49_3`), not live layers —
 * so text stays HTML here and only the artwork is image:
 * - `why/bg.webp` — the section backdrop (corner blobs, leaf, stethoscope)
 *   with the cards/text removed, supplied separately by the designer.
 * - `why/illo-{1..4}.webp` — each card's illustration. 1 and 4 are cut
 *   from the designer's higher-res card exports; 2 and 3 only exist in
 *   the flattened section raster, so they're upscaled from that and
 *   are visibly softer on 2x screens.
 * Illustrations sit on the card with `mix-blend-multiply`, so their
 * near-white crop background drops out against the card's own white.
 *
 * Replaced `ChallengesSection`, whose challenge/solution pairs and photo
 * collage don't exist anywhere in this Figma file.
 */
const ITEMS: {
  illo: string;
  titleKey: "item1Title" | "item2Title" | "item3Title" | "item4Title";
  bodyKey: "item1Body" | "item2Body" | "item3Body" | "item4Body";
  chipKey: "item1Chip" | "item2Chip" | "item3Chip" | "item4Chip";
  chipIcon: LucideIcon;
  number: "01" | "02" | "03" | "04";
}[] = [
  { illo: "/home/why/illo-1.webp", titleKey: "item1Title", bodyKey: "item1Body", chipKey: "item1Chip", chipIcon: Zap, number: "01" },
  { illo: "/home/why/illo-2.webp", titleKey: "item2Title", bodyKey: "item2Body", chipKey: "item2Chip", chipIcon: Users, number: "02" },
  { illo: "/home/why/illo-3.webp", titleKey: "item3Title", bodyKey: "item3Body", chipKey: "item3Chip", chipIcon: LineChart, number: "03" },
  { illo: "/home/why/illo-4.webp", titleKey: "item4Title", bodyKey: "item4Body", chipKey: "item4Chip", chipIcon: PieChart, number: "04" },
];

const TRUST: {
  icon: LucideIcon;
  titleKey: "trust1Title" | "trust2Title" | "trust3Title";
  bodyKey: "trust1Body" | "trust2Body" | "trust3Body";
}[] = [
  { icon: Star, titleKey: "trust1Title", bodyKey: "trust1Body" },
  { icon: Heart, titleKey: "trust2Title", bodyKey: "trust2Body" },
  { icon: Shield, titleKey: "trust3Title", bodyKey: "trust3Body" },
];

export async function WhyHealthyLifeSection() {
  const t = await getTranslations("home.whyHealthyLife");

  return (
    <section id="for-specialists" className="relative isolate overflow-hidden bg-[#f5fbfb] px-4 py-20 sm:px-6 lg:px-8">
      <Image src="/home/why/bg.webp" alt="" fill sizes="100vw" className="-z-10 object-cover" />

      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow={t("eyebrow")}
          title={t.rich("title", {
            highlight: (chunks) => <span className="text-mkt-forest">{chunks}</span>,
          })}
          subtitle={t("subtitle")}
          pill="plain"
        />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ illo, titleKey, bodyKey, chipKey, chipIcon: ChipIcon, number }, i) => (
            <Reveal key={titleKey} delayMs={i * 80}>
              <div className="relative flex h-full flex-col rounded-3xl bg-white/90 p-6 text-start shadow-card">
                <span className="absolute end-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-mkt-forest-bg text-sm font-bold text-mkt-forest">
                  {number}
                </span>
                <Image
                  src={illo}
                  alt=""
                  width={480}
                  height={374}
                  className="mx-auto mb-4 h-auto w-48 mix-blend-multiply [mask-image:radial-gradient(ellipse_closest-side,black_65%,transparent)]"
                />
                <h3 className="mb-3 text-lg font-bold leading-snug text-ink">{t(titleKey)}</h3>
                <p className="mb-6 text-sm leading-7 text-ink-muted">{t(bodyKey)}</p>
                <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full bg-mkt-forest-bg px-4 py-3 text-sm font-semibold text-mkt-forest">
                  <ChipIcon size={17} strokeWidth={2} />
                  {t(chipKey)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={340} className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-10 gap-y-6 rounded-3xl border border-mkt-forest-bg bg-white/80 px-8 py-6 shadow-card">
          {TRUST.map(({ icon: Icon, titleKey, bodyKey }, i) => (
            <div key={titleKey} className={`flex items-center gap-4 ${i > 0 ? "lg:border-s lg:border-mkt-forest/30 lg:ps-10" : ""}`}>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-mkt-forest-bg text-mkt-forest">
                <Icon size={24} strokeWidth={1.75} />
              </div>
              <div className="text-start">
                <div className="font-bold text-ink">{t(titleKey)}</div>
                <div className="text-sm text-ink-muted">{t(bodyKey)}</div>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delayMs={420} className="mt-10 flex items-center justify-center gap-4 text-sm text-ink-muted">
          <span className="h-px w-24 bg-gradient-to-l from-mkt-forest/40 to-transparent" aria-hidden="true" />
          {t("tagline")}
          <span className="h-px w-24 bg-gradient-to-r from-mkt-forest/40 to-transparent" aria-hidden="true" />
        </Reveal>
      </div>
    </section>
  );
}

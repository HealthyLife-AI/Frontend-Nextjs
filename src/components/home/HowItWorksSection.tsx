import { getTranslations } from "next-intl/server";
import { HowItWorksSteps } from "./HowItWorksSteps";
import { SectionHeading } from "./SectionHeading";

/**
 * "How it works" as scrollytelling: the three steps scroll on one side
 * while a sticky product panel on the other switches scene to match the
 * step currently in view (`HowItWorksSteps`). Server shell for the
 * heading; the step tracking is client-side.
 */
export async function HowItWorksSection() {
  const t = await getTranslations("home.howItWorks");

  return (
    <section id="how-it-works" className="relative scroll-mt-24 bg-canvas px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />
        <HowItWorksSteps />
      </div>
    </section>
  );
}

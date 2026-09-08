import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Hero } from "@/components/home/Hero";
import { ProblemSection } from "@/components/home/ProblemSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PatientAppSection } from "@/components/home/PatientAppSection";
import { WhyUsSection } from "@/components/home/WhyUsSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeFooter } from "@/components/home/HomeFooter";

/**
 * Public marketing homepage — built from the "healthylife_ai" mockup
 * added to design-reference/. Supersedes the earlier MVP decision to
 * have `/` redirect straight to `/login` (there was no marketing page
 * to show yet); the redirect is gone, this route now renders one.
 *
 * Every color is a PRD §5.1 token — the reference's own Material-3
 * tonal palette was not adopted, same rule as every other screen built
 * from a Stitch mockup in this project. A few of the reference's
 * specific numeric claims (an exact "3 consultants" headcount, invented
 * time-saved percentages) aren't backed by anything in the PRD/SRS —
 * this is a pre-launch product with no pilot yet, so SocialProofSection
 * states the qualitative claims the docs actually support instead of
 * presenting placeholder marketing stats as fact.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <HomeHeader />
      <main>
        <Hero />
        <ProblemSection />
        <HowItWorksSection />
        <PatientAppSection />
        <WhyUsSection />
        <SocialProofSection />
        <FaqSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}

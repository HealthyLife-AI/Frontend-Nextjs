import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Hero } from "@/components/home/Hero";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { PatientAppSection } from "@/components/home/PatientAppSection";
import { WhyHealthyLifeSection } from "@/components/home/WhyHealthyLifeSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeFooter } from "@/components/home/HomeFooter";

/**
 * Public marketing homepage — visuals ported from the Figma
 * "Healthylife" file (node 49:3); the copy was already in sync with that
 * design before this pass (see `home.*` messages). Supersedes the earlier
 * MVP decision to have `/` redirect straight to `/login` (there was no
 * marketing page to show yet); the redirect is gone, this route now
 * renders one.
 *
 * Every color is a PRD §5.1 token — the Figma file's own raw hex palette
 * (barely any of it tied to a named style) was not adopted wholesale,
 * same rule as every other screen built from a design reference in this
 * project. The Figma file's specific numeric claims (an exact "3
 * consultants" headcount, invented time-saved percentages) aren't backed
 * by anything in the PRD/SRS — this is a pre-launch product with no
 * pilot yet, so `SocialProofSection` states the qualitative claims the
 * docs actually support instead of presenting placeholder marketing
 * stats as fact.
 *
 * Section order matches the Figma file top to bottom. `ChallengesSection`
 * (a "problem/solution pairs + six-card photo collage" layout, replacing
 * the earlier `ProblemSection`/`WhyUsSection`) was retired in favor of
 * `WhyHealthyLifeSection` — that pairs-with-a-photo-collage content was
 * never actually in this Figma file; the real section at that position
 * (`Desktop - 1.svg`, y 3285-4470) is a plain 4-feature grid titled
 * "لماذا HealthyLife؟", which `WhyHealthyLifeSection` now reproduces.
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
        <HowItWorksSection />
        <PatientAppSection />
        <WhyHealthyLifeSection />
        <SocialProofSection />
        <FaqSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}

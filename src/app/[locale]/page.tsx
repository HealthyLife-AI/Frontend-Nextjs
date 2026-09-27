import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Hero } from "@/components/home/Hero";
import { FoodLibraryMarquee } from "@/components/home/FoodLibraryMarquee";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { WhyHealthyLifeSection } from "@/components/home/WhyHealthyLifeSection";
import { PatientAppSection } from "@/components/home/PatientAppSection";
import { PrinciplesSection } from "@/components/home/PrinciplesSection";
import { FaqSection } from "@/components/home/FaqSection";
import { CtaSection } from "@/components/home/CtaSection";
import { HomeFooter } from "@/components/home/HomeFooter";

/**
 * Public marketing homepage.
 *
 * Redesigned as a product-led page in the idiom of contemporary software
 * landing pages: an aurora hero with the product itself as the visual,
 * the real local food library as the "proof" strip, a scroll-driven
 * "how it works", a bento feature grid, and a dark closing band. Motion
 * is the page's signature — word-by-word headline, a dashboard that
 * levels out in 3D, cursor spotlight on cards, a typing AI summary — and
 * all of it is transform/opacity only and switched off under
 * `prefers-reduced-motion` (see the "Homepage motion" block in
 * `globals.css`).
 *
 * This deliberately departs from the earlier Figma-matched layout
 * (`design-system-rules.md` §0) at the user's request; the token system,
 * logical-property rule and i18n conventions from that document still
 * apply throughout. Copy honesty is unchanged: no invented customer
 * logos, testimonials or statistics — every number on the page is
 * either illustrative mockup data (as before) or real catalog data
 * (`foodLibrary.ts`).
 */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });

  return { title: t("title"), description: t("description") };
}

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
        <FoodLibraryMarquee />
        <HowItWorksSection />
        <WhyHealthyLifeSection />
        <PatientAppSection />
        <PrinciplesSection />
        <FaqSection />
        <CtaSection />
      </main>
      <HomeFooter />
    </div>
  );
}

import Image from "next/image";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal } from "./Reveal";

/**
 * Matches the Figma closing CTA (`Desktop - 1.svg`, y 4928-5565): a light
 * section over the designer's nutritionist photo (`cta-bg.webp`, the
 * frame's own `image7_49_3` raster — photo only, no baked-in text), with
 * the copy in a ~545px column pinned to the right (`ml-auto`, physical —
 * the photo doesn't mirror in English, so neither can the copy) and the
 * photo showing through on the left. Measured at 1440px: badge 30px tall,
 * `--color-primary` fill; title in `--color-primary`; body `#3e494b`;
 * button 279x54 in the hero CTA's `#26635e`.
 *
 * Kept from before rather than copied from the frame:
 * - The subtitle. Figma's says leading clinics "raised adherence and cut
 *   plan-prep time by 80%" — a result claim and a specific figure this
 *   pre-launch product can't back (same call `SocialProofSection` makes).
 * - The button's destination. Its label is the frame's "book a free demo",
 *   matching the hero CTA that scrolls here; there's no booking flow in
 *   the MVP, so it opens an email to the published contact address
 *   rather than pointing a "book a demo" label at the sign-up form.
 */
export async function CtaSection() {
  const t = await getTranslations("home.cta");
  const tFooter = await getTranslations("home.footer");
  const email = tFooter("email");

  return (
    <section id="book-demo" className="relative isolate overflow-hidden bg-[#f4f9f8] lg:min-h-[637px]">
      <Image
        src="/home/cta-bg.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-left-top lg:object-top"
      />
      {/* Below `lg` the photo slides under the copy; this keeps it legible. */}
      <div className="absolute inset-0 -z-10 bg-white/75 lg:hidden" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1210px] px-4 py-20 sm:px-6 lg:px-0 lg:pt-[95px] lg:pb-[150px]">
        <Reveal className="lg:ml-auto lg:w-[545px]">
          <span className="inline-flex h-[30px] items-center gap-1.5 rounded-full bg-primary px-3 text-[13px] text-white">
            <BadgeCheck size={15} strokeWidth={1.75} />
            {t("badge")}
          </span>

          <h2 className="mt-9 text-3xl font-bold leading-snug text-primary lg:text-[34px] lg:leading-[62px]">
            {t("title")}
          </h2>

          <p className="mt-6 text-lg leading-8 text-mkt-nav-muted lg:text-[20px] lg:leading-[40px]">{t("subtitle")}</p>

          <a
            href={`mailto:${email}?subject=${encodeURIComponent(t("button"))}`}
            className="mt-10 inline-flex h-[54px] items-center gap-3 rounded-[12px] bg-mkt-teal-cta px-7 text-base font-bold text-white transition-colors hover:bg-mkt-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mkt-teal-deep focus-visible:ring-offset-2"
          >
            {t("button")}
            <ArrowLeft size={18} strokeWidth={2} className="rtl:rotate-0 ltr:rotate-180" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

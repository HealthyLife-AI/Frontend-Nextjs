import Image from "next/image";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

/**
 * Hero — rebuilt to match the Figma "Healthylife" landing frame (node
 * 49:3) 1:1 at the 1440px design width, measured off the SVG export in
 * `design-reference/SVG for image design/Desktop - 1.svg`:
 *
 *   badge rect   x 456..702  y 169..215  r8   #B9F7FF @ 20%
 *   headline               y 247..352        #006572, 33/61
 *   brush stroke x 320..392 y 299..303       #006B54 (raster of the
 *                                            Figma path, `headline-brush.png`)
 *   body copy              y 399..490        #3D4949, 18/35
 *   primary CTA  x 482..705 y 525..573  r15  #26635E
 *   outline CTA  x 223..476 y 525..573  r15  1px #006B54
 *
 * The whole background — photo, teal wave, leaf art — is one flattened
 * 1600x901 raster in the Figma file, so it ships as one image rather
 * than being re-drawn in CSS. The text column sits in the *left* half
 * (right-aligned, per RTL) because the plated-salad half of that image
 * occupies the right: a 620px *right* margin (physical, not `ms-`)
 * inside the 1210px content box lands the column's right edge on x=705,
 * the design's — physical because the photo doesn't mirror in English,
 * so the copy has to stay on the photo's empty side there too.
 *
 * The desktop/mobile device mockups that used to live here are gone —
 * the Figma hero has no mockup at all.
 *
 * Copy is the frame's own, which reverses two earlier calls on this
 * page: the headline drops its second highlight (the frame emphasizes
 * only "أسرع", with the brush stroke) and the primary CTA is the
 * frame's "احجز عرضًا تجريبيًا مجانيًا" rather than "ابدأ مجانًا",
 * which had been chosen so the page wouldn't offer a demo booking the
 * MVP can't honor (BR-6). It points at #book-demo, the same contact
 * section `HomeHeader` already links to.
 *
 * `lg:text-[33px]` is not the Figma frame's own headline size: that
 * frame is set in a geometric Arabic face this project doesn't license,
 * and Cairo (the PRD §5.1 binding font, kept) runs ~24% wider per em.
 * 33px is the size at which Cairo reproduces the design's measured line
 * box — 502px vs 510px for line 1, breaking after "ومرضاك" exactly as
 * the frame does — at the cost of ~8% shorter glyphs. Same reasoning
 * sets the 20px body copy, which wraps to the design's three lines.
 *
 */
export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative isolate overflow-hidden lg:min-h-[842px]">
      <Image
        src="/home/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-left lg:object-center"
      />
      {/*
       * Legibility scrim for narrow viewports only: below `lg` the 16:9
       * background is cropped hard enough that the plated-food half can
       * slide under the copy. At `lg`+ the design's own empty cream half
       * sits behind the text and no scrim is needed.
       */}
      <div className="absolute inset-0 -z-10 bg-[#f9f9ed]/65 lg:hidden" aria-hidden="true" />

      <div className="mx-auto w-full max-w-[1210px] px-4 pt-28 pb-20 sm:px-6 lg:px-0 lg:pt-[169px] lg:pb-[269px]">
        <Reveal className="lg:ml-auto lg:mr-[620px] lg:w-[512px]">
          <p className="inline-flex min-h-[46px] items-center rounded-[8px] bg-mkt-sky/20 px-[13px] py-2 text-[13px] font-medium text-mkt-teal-deep">
            {t("badge")}
          </p>

          <h1 className="mt-5 text-[30px] font-semibold leading-[1.45] text-mkt-teal-deep sm:text-[36px] lg:mt-[23px] lg:text-[33px] lg:leading-[61px]">
            {t.rich("headline", {
              highlight: (chunks) => (
                <span className="relative font-extrabold">
                  {chunks}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 -bottom-[3px] block h-[4px] bg-[url('/home/headline-brush.png')] bg-[length:100%_100%] bg-no-repeat"
                  />
                </span>
              ),
            })}
          </h1>

          <p className="mt-6 text-[16px] leading-[30px] text-mkt-body lg:mt-[29px] lg:text-[20px] lg:leading-[35px]">
            {t("subheadline")}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-1.5 lg:mt-[31px]">
            <a
              href="#book-demo"
              className="inline-flex h-12 items-center gap-[18px] rounded-[15px] bg-mkt-teal-cta px-[21px] text-[16px] font-medium text-white transition-colors hover:bg-mkt-teal-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mkt-teal-deep focus-visible:ring-offset-2"
            >
              <CalendarIcon />
              {t("ctaPrimary")}
            </a>

            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center gap-[11px] rounded-[15px] border border-mkt-jade px-[28px] text-[16px] font-medium text-mkt-teal-cta transition-colors hover:bg-mkt-jade/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mkt-jade focus-visible:ring-offset-2"
            >
              <PlayCircleIcon />
              {t("ctaSecondary")}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/*
 * Both icons are the Figma frame's own vector paths, copied verbatim
 * from the SVG export and shown through a viewBox offset to where they
 * sat on the 1440px canvas — lucide's near-equivalents (`Calendar`,
 * `PlayCircle`) are drawn as strokes on a 24px grid and don't match
 * these filled Material shapes.
 */
function CalendarIcon() {
  return (
    <svg
      viewBox="677.062 538 13.5 15"
      width="13.5"
      height="15"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d="M678.562 553C678.149 553 677.796 552.853 677.502 552.559C677.208 552.266 677.062 551.913 677.062 551.5V541C677.062 540.588 677.208 540.234 677.502 539.941C677.796 539.647 678.149 539.5 678.562 539.5H679.312V538H680.812V539.5H686.812V538H688.312V539.5H689.062C689.474 539.5 689.827 539.647 690.121 539.941C690.415 540.234 690.562 540.588 690.562 541V551.5C690.562 551.913 690.415 552.266 690.121 552.559C689.827 552.853 689.474 553 689.062 553H678.562ZM678.562 551.5H689.062V544H678.562V551.5ZM678.562 542.5H689.062V541H678.562V542.5ZM678.562 542.5V541V542.5Z" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg
      viewBox="436 540.667 16.667 16.667"
      width="16.667"
      height="16.667"
      fill="currentColor"
      aria-hidden="true"
      className="shrink-0 text-mkt-jade"
    >
      <path d="M442.25 552.75L448.083 549L442.25 545.25V552.75ZM444.333 557.333C443.181 557.333 442.097 557.115 441.083 556.677C440.069 556.24 439.188 555.646 438.438 554.896C437.688 554.146 437.094 553.264 436.656 552.25C436.219 551.236 436 550.153 436 549C436 547.847 436.219 546.764 436.656 545.75C437.094 544.736 437.688 543.854 438.438 543.104C439.188 542.354 440.069 541.76 441.083 541.323C442.097 540.885 443.181 540.667 444.333 540.667C445.486 540.667 446.569 540.885 447.583 541.323C448.597 541.76 449.479 542.354 450.229 543.104C450.979 543.854 451.573 544.736 452.01 545.75C452.448 546.764 452.667 547.847 452.667 549C452.667 550.153 452.448 551.236 452.01 552.25C451.573 553.264 450.979 554.146 450.229 554.896C449.479 555.646 448.597 556.24 447.583 556.677C446.569 557.115 445.486 557.333 444.333 557.333ZM444.333 555.667C446.194 555.667 447.771 555.021 449.062 553.729C450.354 552.437 451 550.861 451 549C451 547.139 450.354 545.562 449.062 544.271C447.771 542.979 446.194 542.333 444.333 542.333C442.472 542.333 440.896 542.979 439.604 544.271C438.312 545.562 437.667 547.139 437.667 549C437.667 550.861 438.312 552.437 439.604 553.729C440.896 555.021 442.472 555.667 444.333 555.667Z" />
    </svg>
  );
}

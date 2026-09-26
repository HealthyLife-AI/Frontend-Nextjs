"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

const QUESTIONS = [
  { questionKey: "q1Question", answerKey: "q1Answer" },
  { questionKey: "q2Question", answerKey: "q2Answer" },
  { questionKey: "q3Question", answerKey: "q3Answer" },
  { questionKey: "q4Question", answerKey: "q4Answer" },
] as const;

/**
 * A two-column split in the Figma reference (`Desktop - 1.svg`,
 * y 4380-4850) — the accordion on one side, a right-aligned (not
 * centered) eyebrow/title/subtitle block on the other — not the
 * centered `SectionHeading`-above-a-single-column layout every other
 * section here uses; bespoke markup instead of stretching that shared
 * component to cover a one-off asymmetric case. The eyebrow is also a
 * bordered pill with no dot, a fourth eyebrow treatment the reference
 * doesn't use anywhere else on the page.
 *
 * Figma gives only its first question real, distinct copy; the other
 * three accordion rows all reuse that same placeholder string verbatim
 * (a duplicated layer, never rewritten). `q2`-`q4` here are genuine
 * questions instead, same call `SocialProofSection` already makes for
 * its own placeholder-precise Figma stats.
 */
export function FaqSection() {
  const t = useTranslations("home.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-card px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1216px] gap-10 lg:grid-cols-[29rem_1fr] lg:items-start lg:gap-[53px]">
        <Reveal className="text-center lg:sticky lg:top-28 lg:text-start">
          <span className="inline-flex items-center rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-4 py-1.5 text-sm font-semibold text-mkt-emerald-deep">
            {t("eyebrow")}
          </span>
          <h2 className="mt-3 text-2xl font-bold text-ink sm:text-3xl">{t("title")}</h2>
          <p className="mt-3 text-ink-muted">{t("subtitle")}</p>
        </Reveal>

        <div className="flex flex-col gap-3.5">
          {QUESTIONS.map(({ questionKey, answerKey }, index) => {
            const open = openIndex === index;

            return (
              <Reveal key={questionKey} delayMs={index * 60}>
                <div className="rounded-card bg-mkt-mint-bg">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 px-5 py-[26px] text-start"
                  >
                    <span className="font-semibold text-ink">{t(questionKey)}</span>
                    <ChevronDown
                      size={20}
                      className={`shrink-0 text-ink-muted transition-transform duration-200 ${
                        open ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    className={`grid overflow-hidden transition-all duration-300 ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="px-5 pb-5 leading-relaxed text-ink-muted">{t(answerKey)}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

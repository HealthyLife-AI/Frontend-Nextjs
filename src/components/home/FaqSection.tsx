"use client";

import { useState } from "react";
import { ArrowUpRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";

const QUESTIONS = [
  { questionKey: "q1Question", answerKey: "q1Answer" },
  { questionKey: "q2Question", answerKey: "q2Answer" },
  { questionKey: "q3Question", answerKey: "q3Answer" },
  { questionKey: "q4Question", answerKey: "q4Answer" },
] as const;

/**
 * Two-column FAQ: a sticky heading with a "still have a question?" card
 * on one side, the accordion on the other. Answers open with the
 * grid-rows height trick (no measuring), the plus icon rotates into a
 * cross, and only one answer is open at a time.
 */
export function FaqSection() {
  const t = useTranslations("home.faq");
  const tFooter = useTranslations("home.footer");
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const email = tFooter("email");

  return (
    <section id="faq" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[26rem_1fr] lg:items-start lg:gap-20">
        <Reveal className="text-start lg:sticky lg:top-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-mkt-mint-border bg-mkt-mint-bg px-4 py-1.5 text-sm font-semibold text-mkt-emerald-deep">
            {t("eyebrow")}
          </span>
          <h2 className="mt-5 text-balance text-3xl font-extrabold leading-[1.2] text-ink sm:text-4xl lg:text-[44px] lg:leading-[1.15] ltr:tracking-tight">
            {t("title")}
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-ink-muted">{t("subtitle")}</p>

          <div className="mt-8 rounded-3xl border border-ink/[0.07] bg-canvas p-6">
            <div className="text-base font-bold text-ink">{t("moreTitle")}</div>
            <p className="mt-1 text-sm text-ink-muted">{t("moreBody")}</p>
            <a
              href={`mailto:${email}`}
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-mkt-teal-deep transition-colors hover:text-primary"
            >
              {t("moreLink")}
              <ArrowUpRight size={16} strokeWidth={2.2} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </a>
          </div>
        </Reveal>

        <div className="flex flex-col gap-3">
          {QUESTIONS.map(({ questionKey, answerKey }, index) => {
            const open = openIndex === index;

            return (
              <Reveal key={questionKey} delayMs={index * 70}>
                <div
                  className={`rounded-2xl border transition-[background-color,border-color,box-shadow] duration-400 ${
                    open ? "border-primary/25 bg-white shadow-panel" : "border-ink/[0.07] bg-canvas hover:border-primary/20"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    aria-controls={`faq-answer-${index}`}
                    className="flex w-full items-center gap-4 px-5 py-5 text-start sm:px-6"
                  >
                    <span className={`mkt-nums text-sm font-bold ${open ? "text-primary" : "text-ink-muted"}`}>{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-base font-bold text-ink sm:text-lg">{t(questionKey)}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-400 ${
                        open ? "rotate-45 bg-primary text-white" : "bg-white text-ink-muted shadow-card"
                      }`}
                    >
                      <Plus size={16} strokeWidth={2.2} />
                    </span>
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={`grid transition-[grid-template-rows,opacity] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                      open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <p className="px-5 pb-6 ps-[3.75rem] text-pretty leading-relaxed text-ink-muted sm:px-6 sm:ps-16">{t(answerKey)}</p>
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

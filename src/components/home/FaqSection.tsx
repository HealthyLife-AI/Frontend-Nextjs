"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const QUESTIONS = [
  { questionKey: "q1Question", answerKey: "q1Answer" },
  { questionKey: "q2Question", answerKey: "q2Answer" },
  { questionKey: "q3Question", answerKey: "q3Answer" },
  { questionKey: "q4Question", answerKey: "q4Answer" },
] as const;

export function FaqSection() {
  const t = useTranslations("home.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="flex flex-col gap-3">
          {QUESTIONS.map(({ questionKey, answerKey }, index) => {
            const open = openIndex === index;

            return (
              <Reveal key={questionKey} delayMs={index * 60}>
                <div className="rounded-card border border-border bg-card shadow-card">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-4 p-5 text-start"
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
                    <p className="min-h-0 px-5 pb-5 leading-relaxed text-ink-muted">{t(answerKey)}</p>
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

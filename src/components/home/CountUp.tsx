"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./useInView";

/**
 * A figure that counts up to itself when it scrolls into view.
 *
 * The copy is not touched: the server renders the translated string as
 * it stands (so a crawler, a no-JS visitor and a reduced-motion visitor
 * all read the real number), and the tween only rewrites the digits on
 * the way up, landing on the original string character for character.
 *
 * The number is read out of the string rather than passed separately,
 * because these values live in `messages/{ar,en}.json` with their own
 * prefix/suffix — `"7,800+"` in English, `"+7,800"` in Arabic. Grouping
 * and decimals are reproduced from the source string, never from the
 * locale, so an Arabic page keeps the Western digits and ASCII comma the
 * message file uses instead of switching to Arabic-Indic numerals
 * mid-count.
 *
 * Anything that is not a single plain number is left completely alone —
 * `"06:00"` is a clock time, not a quantity, and a leading zero means
 * the formatting is deliberate.
 */
const NUMBER = /^(\D*?)(\d[\d,.]*)(\D*)$/u;

export function CountUp({
  value,
  className = "",
  durationSeconds = 1.6,
  dir,
}: {
  value: string;
  className?: string;
  durationSeconds?: number;
  /** Pinned to "ltr" where a figure keeps its Western digit order inside an RTL line. */
  dir?: "ltr" | "rtl";
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const match = NUMBER.exec(value);
    if (!match) return;

    const [, prefix, raw, suffix] = match;
    const plain = raw.replace(/,/g, "");
    if (/^0\d/.test(plain)) return;

    const target = Number.parseFloat(plain);
    if (!Number.isFinite(target)) return;

    const grouped = raw.includes(",");
    const decimals = plain.includes(".") ? (plain.split(".")[1]?.length ?? 0) : 0;
    const format = (n: number) =>
      grouped
        ? n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : n.toFixed(decimals);

    const counter = { n: 0 };
    el.textContent = prefix + format(0) + suffix;

    const tween = gsap.to(counter, {
      n: target,
      duration: durationSeconds,
      ease: "power2.out",
      snap: decimals === 0 ? { n: 1 } : undefined,
      onUpdate: () => {
        el.textContent = prefix + format(counter.n) + suffix;
      },
      // Lands on the message string itself, so the final text is the
      // translation and not something this component formatted.
      onComplete: () => {
        el.textContent = value;
      },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.textContent = value;
    };
  }, [value, durationSeconds]);

  return (
    <span ref={ref} className={className} dir={dir}>
      {value}
    </span>
  );
}

"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion, useInView } from "./useInView";

/**
 * Types `text` out character by character once it scrolls into view —
 * used for the illustrative AI weekly summary. Rendering a growing
 * prefix of an Arabic string is safe: the shaping engine re-joins the
 * letters on every paint, so the last glyph simply changes form as its
 * neighbour arrives, exactly as it does in a text field.
 *
 * Reduced motion: the full text renders at once, no caret.
 */
export function Typewriter({
  text,
  speedMs = 26,
  className = "",
  dir,
  lang,
}: {
  text: string;
  speedMs?: number;
  className?: string;
  dir?: "rtl" | "ltr";
  lang?: string;
}) {
  const { ref, inView } = useInView<HTMLParagraphElement>({ threshold: 0.4, rootMargin: "0px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      // Necessary setState-in-effect: reduced-motion can only be read client-side.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(text.length);
      return;
    }
    let current = 0;
    const id = window.setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= text.length) window.clearInterval(id);
    }, speedMs);
    return () => window.clearInterval(id);
  }, [inView, text, speedMs]);

  const done = count >= text.length;

  return (
    <p ref={ref} dir={dir} lang={lang} className={className} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span aria-hidden="true" className={`ms-0.5 inline-block h-[1em] w-0.5 translate-y-[0.15em] bg-current ${done ? "opacity-0" : "animate-caret"}`} />
    </p>
  );
}

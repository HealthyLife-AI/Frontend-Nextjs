"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./useInView";

/**
 * The homepage headline's blur reveal: each word arrives out of focus and
 * below the line, then sharpens and rises into place, one after the next.
 *
 * This is React Bits' BlurText effect (`blur`, direction `top`), rebuilt
 * on GSAP rather than vendored: the published component renders its own
 * `<p>` with one `motion.span` per word, which cannot hold this headline
 * — the middle run is a gradient-clipped `<span>` with an SVG underline
 * inside an `<h1>`, and a `<p>` inside an `<h1>` is invalid HTML. Driving
 * the words the server already rendered keeps the gradient, the
 * underline, the RTL flow and the heading semantics, and keeps the page
 * on one animation engine (GSAP) instead of adding `motion` alongside it.
 *
 * The wrapper is `display: contents`, so it adds no box to the heading.
 * `SplitWords` with `blur` marks each word `data-blur-word`; the start
 * state lives in CSS so no-JS and pre-hydration paints are identical
 * (see `[data-blur-word]` in globals.css), and the attribute is dropped
 * the moment GSAP takes the words over.
 */
export function BlurText({
  children,
  delaySeconds = 0,
  stagger = 0.055,
}: {
  children: ReactNode;
  delaySeconds?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const words = Array.from(el.querySelectorAll<HTMLElement>("[data-blur-word]"));
    if (words.length === 0) return;

    const release = () => words.forEach((word) => word.removeAttribute("data-blur-word"));

    if (prefersReducedMotion()) {
      release();
      return;
    }

    // Copy the CSS start state onto the inline style first, then drop the
    // attribute: the element never paints a frame between the two.
    gsap.set(words, { opacity: 0, y: "0.6em", filter: "blur(10px)" });
    release();

    const tween = gsap.to(words, {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      duration: 0.9,
      ease: "power3.out",
      stagger,
      delay: delaySeconds,
      clearProps: "filter",
    });

    return () => {
      tween.kill();
    };
  }, [delaySeconds, stagger]);

  return (
    <span ref={ref} className="contents">
      {children}
    </span>
  );
}

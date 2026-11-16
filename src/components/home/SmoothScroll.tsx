"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./useInView";

/**
 * Lenis smooth scroll for the marketing homepage, driven by GSAP's ticker.
 *
 * Why one ticker and not two: Lenis animates the scroll position on its
 * own rAF loop by default, while ScrollTrigger reads that position on
 * another. Two loops means ScrollTrigger can read a frame-old scroll
 * position, which shows up as reveals firing a few pixels late and as
 * jitter on anything pinned. Handing `lenis.raf` to `gsap.ticker` makes
 * GSAP the single clock: scroll position is updated, then every tween
 * that depends on it, in that order, in one frame.
 *
 * `lagSmoothing(0)` is Lenis's documented requirement: GSAP otherwise
 * clamps the delta it reports after a long frame (a tab coming back from
 * the background), which would hand Lenis a time jump and make the page
 * lurch.
 *
 * Mounted once, by the homepage only — the dashboard keeps native
 * scrolling, since smooth-scrolling a working tool fights the user.
 * Under `prefers-reduced-motion` Lenis is never constructed: the browser's
 * own instant scrolling is exactly what that preference asks for.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      // In-page anchors (the hero's "how it works" link) scroll through
      // Lenis instead of jumping, which also keeps ScrollTrigger in step.
      anchors: true,
    });

    const update = () => ScrollTrigger.update();
    lenis.on("scroll", update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", update);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return null;
}

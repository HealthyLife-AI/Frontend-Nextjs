"use client";

import { useEffect, useRef, useState } from "react";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The one IntersectionObserver hook every homepage motion component
 * shares (Reveal, HeroVisual, HowItWorksSteps, Typewriter). Starts
 * `false` on both server and first client render — the reduced-motion
 * short-circuit runs inside the effect, never in the initializer, so an
 * OS-level "reduce motion" setting can't cause a hydration mismatch
 * (see Reveal's original note on why).
 *
 * `once` (default) disconnects after the first intersection: a reveal
 * plays once and stays. `once: false` keeps reporting, which the
 * scrollytelling steps need to know which step is currently on screen.
 */
export function useInView<T extends HTMLElement>({
  threshold = 0.15,
  rootMargin = "0px 0px -40px 0px",
  once = true,
}: {
  threshold?: number | number[];
  rootMargin?: string;
  once?: boolean;
} = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Necessary setState-in-effect: `matchMedia` needs `window`, so this
      // can only be read client-side post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}

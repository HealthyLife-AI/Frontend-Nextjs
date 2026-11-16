"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { gsap } from "@/lib/motion/gsap";
import { prefersReducedMotion } from "./useInView";

type Variant = "up" | "fade" | "scale" | "blur";

/** Where each variant lands. The matching start state is CSS (`[data-reveal]` in globals.css). */
const TO: Record<Variant, gsap.TweenVars> = {
  up: { y: 0, opacity: 1 },
  fade: { opacity: 1 },
  scale: { scale: 1, opacity: 1 },
  blur: { y: 0, opacity: 1, filter: "blur(0px)" },
};

/**
 * Scroll-triggered entrance for the marketing homepage only (product
 * screens stay effect-free). Plays once, the first time the block
 * enters the viewport.
 *
 * GSAP ScrollTrigger drives it, sharing the instance in
 * `lib/motion/gsap.ts` that `SmoothScroll` pins Lenis to — so a reveal
 * is measured against the same scroll position the smooth scroller is
 * animating, not a frame behind it.
 *
 * Why the start state is a CSS attribute (`data-reveal`) and not an
 * inline style: GSAP writes the element's inline style on every frame,
 * and React would re-assert its own `style` prop on the next render and
 * snap the block back to hidden. An attribute React removes once the
 * tween has started leaves the inline styles GSAP owns untouched.
 *
 * Beyond its own fade/slide, it marks the wrapper with `data-inview`
 * when visible so purely-CSS child animations (`.mkt-grow`, `.mkt-ring`,
 * `.mkt-draw`, `.mkt-rise` in globals.css) can key off it — one trigger
 * per block instead of one per animated detail.
 *
 * Respects `prefers-reduced-motion`: the block is shown at rest on mount
 * and no trigger is ever created.
 */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
  variant = "up",
  threshold,
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
  variant?: Variant;
  threshold?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const [inView, setInView] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      // Necessary setState-in-effect: `matchMedia` needs `window`, so the
      // preference can only be read client-side, post-mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStarted(true);
      setInView(true);
      return;
    }

    const tween = gsap.to(el, {
      ...TO[variant],
      duration: 0.9,
      ease: "power3.out",
      delay: delayMs / 1000,
      clearProps: "filter",
      scrollTrigger: {
        trigger: el,
        start: `top ${threshold === undefined ? 90 : Math.round((1 - threshold) * 100)}%`,
        once: true,
        onEnter: () => {
          setStarted(true);
          setInView(true);
        },
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [variant, delayMs, threshold]);

  return (
    <div
      ref={ref}
      data-reveal={started ? undefined : variant}
      data-inview={inView ? "" : undefined}
      className={className}
    >
      {children}
    </div>
  );
}

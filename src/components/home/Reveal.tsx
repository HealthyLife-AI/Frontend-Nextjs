"use client";

import type { ReactNode } from "react";
import { useInView } from "./useInView";

type Variant = "up" | "fade" | "scale" | "blur";

const HIDDEN: Record<Variant, string> = {
  up: "translate-y-6 opacity-0",
  fade: "opacity-0",
  scale: "scale-[0.96] opacity-0",
  blur: "translate-y-4 opacity-0 blur-sm",
};

/**
 * Scroll-triggered entrance for the marketing homepage only (product
 * screens stay effect-free). Plays once, the first time the block
 * enters the viewport.
 *
 * Beyond its own fade/slide, it marks the wrapper with `data-inview`
 * when visible so purely-CSS child animations (`.mkt-grow`, `.mkt-ring`,
 * `.mkt-draw`, `.mkt-rise` in globals.css) can key off it — one observer
 * per block instead of one per animated detail.
 *
 * Respects `prefers-reduced-motion` via `useInView`: content renders
 * visible immediately and the observer never attaches.
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
  const { ref, inView } = useInView<HTMLDivElement>({ threshold });

  return (
    <div
      ref={ref}
      data-inview={inView ? "" : undefined}
      className={`transition-[opacity,transform,filter] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
        inView ? "translate-y-0 scale-100 opacity-100 blur-none" : HIDDEN[variant]
      } ${className}`}
      style={{ transitionDelay: inView ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

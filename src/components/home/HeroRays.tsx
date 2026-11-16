"use client";

import { useEffect, useState } from "react";
import LightRays from "@/components/reactbits/LightRays";
import { prefersReducedMotion } from "./useInView";

/**
 * React Bits' Light Rays as the hero's moving backdrop, over the plated-
 * meal photograph and under the copy.
 *
 * The component paints to a WebGL canvas, so it needs a resolved colour
 * string — `toRgb`-style parsing cannot read a CSS variable. The brand
 * tint is therefore read off `:root` at mount
 * (`--color-mkt-glow`, the same mint the hero aurora and the dark
 * sections use) rather than written as a hex literal here, which keeps
 * the rule that colours come from tokens (`design-system-rules.md` §1)
 * and means a token change moves the rays with everything else.
 *
 * Nothing renders until that value is read, so the server and the first
 * client paint agree; and nothing renders at all under
 * `prefers-reduced-motion`, which leaves the hero's existing static
 * photo and gradients exactly as they were.
 *
 * The settings are deliberately quiet — slow, wide, dim, no cursor
 * tracking and no pulsing — because this sits behind a headline that has
 * to stay readable.
 */
export function HeroRays() {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const token = getComputedStyle(document.documentElement).getPropertyValue("--color-mkt-glow").trim();
    if (token) {
      // Necessary setState-in-effect: computed styles need a live document.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColor(token);
    }
  }, []);

  if (!color) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem] lg:h-[56rem]" aria-hidden="true">
      <LightRays
        raysColor={color}
        raysOrigin="top-center"
        lightMode
        raysSpeed={0.45}
        lightSpread={1.1}
        rayLength={2.2}
        rayDensity={0.7}
        raySharpness={0.2}
        glow={0.35}
        haze={0.2}
        intensity={0.55}
        opacity={0.5}
        saturation={0.85}
        pulsating={false}
        followMouse={false}
        cursorShadow={false}
        clickPulse={false}
        maxDevicePixelRatio={1.5}
        className="h-full w-full"
      />
    </div>
  );
}

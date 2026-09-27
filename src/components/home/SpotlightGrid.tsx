"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Cursor spotlight for the bento grid: one pointer listener on the grid
 * writes each `.mkt-spot` card's local pointer position into `--mx` /
 * `--my`, which the card's pseudo-elements (globals.css) turn into a
 * soft glow and a lit border that follow the cursor. Cards themselves
 * stay server-rendered children — this wrapper only adds the tracking.
 *
 * Skipped on coarse pointers (there is no cursor to follow) and under
 * reduced motion; the hover styles simply never activate there.
 */
export function SpotlightGrid({ className = "", children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        grid.querySelectorAll<HTMLElement>(".mkt-spot").forEach((card) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
          card.style.setProperty("--my", `${e.clientY - rect.top}px`);
        });
      });
    };

    grid.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      grid.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

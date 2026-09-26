"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Fades + slides a section's content up into place the first time it
 * scrolls into view — the "professional effects" pass on the marketing
 * homepage only (the actual product screens stay effect-free; this is
 * presentation chrome, not app UI).
 *
 * Respects `prefers-reduced-motion`: when set, content renders visible
 * immediately and the observer never attaches, rather than firing a
 * motion effect a reduced-motion mode is supposed to skip.
 */
export function Reveal({
  children,
  delayMs = 0,
  className = "",
}: {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // Always false on first render, matching the server (which has no
  // `window` to check) — checking `prefersReducedMotion()` straight into
  // `useState`'s initializer reads the real value on the client's first
  // render too, which for anyone with the OS setting on is guaranteed to
  // disagree with the server's "false" and throw a hydration mismatch on
  // every single page load. The real check still happens client-only,
  // just deferred into the effect below instead of the render itself.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) {
      // Necessary setState-in-effect: `matchMedia` needs `window`, so this
      // can only be read client-side post-mount — there's no render-time
      // computation that could replace it.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

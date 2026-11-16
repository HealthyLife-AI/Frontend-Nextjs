"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import StarBorder from "@/components/reactbits/StarBorder";
import { Link } from "@/i18n/navigation";

/**
 * React Bits' Star Border on the page's primary call to action: a single
 * point of light that laps the button's edge.
 *
 * The button's own look is unchanged — same teal gradient, same white
 * label, same pill. Star Border takes its surface, label and rim as CSS
 * values, so those are handed to it as the existing tokens rather than
 * restyled; the size and weight that its own base classes would
 * otherwise set are overridden inline, which beats class order
 * regardless of how Tailwind happens to sort two competing utilities.
 *
 * The travelling point keeps the component's white default and only its
 * trail is tinted, read off `:root` after mount because the effect is
 * painted to a canvas and cannot resolve `var(...)`. Until it is read the
 * trail is white, so the server-rendered button is complete and correct
 * with no JavaScript at all — this is a link, not decoration.
 *
 * Star Border stops the point moving under `prefers-reduced-motion` on
 * its own (`cruise = reduce ? 0 : …`), which leaves a plain static
 * button.
 */
export function BrandStarBorder({
  href,
  children,
  className = "",
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const [trailColor, setTrailColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--color-mkt-glow").trim();
    if (token) {
      // Necessary setState-in-effect: computed styles need a live document.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTrailColor(token);
    }
  }, []);

  return (
    <StarBorder
      as={Link}
      href={href}
      theme="light"
      radius={999}
      thickness={1}
      duration={7}
      stars={1}
      trailLength={0.4}
      glow={0.45}
      sparkle={false}
      hover="brighten"
      clickPulse={false}
      trailColor={trailColor}
      backgroundColor="linear-gradient(to bottom right, var(--color-primary), var(--color-mkt-teal-deep))"
      textColor="var(--color-card)"
      borderColor="var(--color-mkt-glow)"
      className={className}
      style={{ fontWeight: 700, ...style }}
    >
      {children}
    </StarBorder>
  );
}

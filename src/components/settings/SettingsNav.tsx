"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

export type SettingsNavItem = { id: string; label: string; icon: LucideIcon };

/**
 * The side column's list of the page's sections. Plain in-page anchors
 * (html's smooth scroll and scroll-padding handle motion preference and
 * the fixed header). The section crossing a band near the top of the
 * viewport is marked current. Vertical when the two columns sit side by
 * side; a horizontal, scrollable row of pills when the side column stacks
 * above the main one (container query on the page layout).
 */
export function SettingsNav({ label, items }: { label: string; items: SettingsNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    // Callbacks only carry the entries that changed, so keep the set in the band.
    const inBand = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) inBand.add(e.target.id);
          else inBand.delete(e.target.id);
        }
        // Topmost section in the band wins, in page order.
        const first = items.find((item) => inBand.has(item.id));
        if (first) setActive(first.id);
      },
      { rootMargin: "-100px 0px -55% 0px" }
    );
    sections.forEach((s) => observer.observe(s));

    // The last section is short and can never reach the band: at the very
    // bottom of the page, it is the current one.
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) setActive(items[items.length - 1].id);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label={label} className="rounded-panel border border-border/70 bg-card p-2 shadow-panel">
      <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] @min-[860px]:flex-col [&::-webkit-scrollbar]:hidden">
        {items.map(({ id, label: itemLabel, icon: Icon }) => {
          const current = active === id;
          return (
            <li key={id} className="shrink-0">
              <a
                href={`#${id}`}
                onClick={() => setActive(id)}
                aria-current={current ? "location" : undefined}
                className={`flex min-h-[42px] items-center gap-2.5 whitespace-nowrap rounded-full px-3.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 @min-[860px]:rounded-xl ${
                  current ? "bg-primary/10 font-extrabold text-primary" : "font-semibold text-ink-muted hover:bg-canvas hover:text-ink"
                }`}
              >
                <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
                {itemLabel}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

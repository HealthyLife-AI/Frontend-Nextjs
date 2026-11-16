import type { CSSProperties } from "react";

/**
 * Renders a string as one span per word so the hero headline can arrive
 * word by word (`.mkt-word` in globals.css: blur → sharp, rising). Pure
 * markup, no client JS — the CSS animation starts on paint.
 *
 * Words are split on whitespace only. That is safe for Arabic: letter
 * joining happens inside a word, never across a space, so wrapping each
 * word in its own inline-block leaves the script's shaping untouched.
 * The separating space is emitted as a text node *between* spans (not
 * inside them), because trailing whitespace inside an inline-block is
 * collapsed away.
 *
 * `startIndex` lets a headline made of several runs (before / highlight /
 * after) continue one stagger sequence instead of restarting per run.
 *
 * `blur` hands the words to GSAP instead (`BlurText.tsx`): each word is
 * marked `data-blur-word` and starts from the state that attribute
 * carries in `globals.css`, rather than running the `.mkt-word` CSS
 * animation. `inline-block` is a class either way, because it is layout,
 * not animation — a word left `inline` would ignore the transform the
 * moment the attribute comes off.
 */
export function SplitWords({
  text,
  startIndex = 0,
  offsetMs = 0,
  className = "",
  blur = false,
}: {
  text: string;
  startIndex?: number;
  offsetMs?: number;
  className?: string;
  blur?: boolean;
}) {
  const words = text.split(/\s+/).filter(Boolean);

  return (
    <>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          {i > 0 ? " " : null}
          {blur ? (
            <span data-blur-word="" className={`inline-block ${className}`}>
              {word}
            </span>
          ) : (
            <span
              className={`mkt-word ${className}`}
              style={{ "--i": startIndex + i, "--offset": `${offsetMs}ms` } as CSSProperties}
            >
              {word}
            </span>
          )}
        </span>
      ))}
    </>
  );
}

/** How many words `text` contributes to the shared stagger sequence. */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

import { getLocale, getTranslations } from "next-intl/server";
import { FOOD_LIBRARY, type FoodEntry } from "./foodLibrary";
import { Reveal } from "./Reveal";

const TONES = ["bg-mkt-mint", "bg-primary", "bg-status-attention", "bg-mkt-emerald"];

/**
 * Two counter-scrolling tickers of the platform's own local food
 * catalog — the honest replacement for a "trusted by" logo strip on a
 * product that has no customer logos to show yet. Each chip is a real
 * seeded dish with its stored kcal/100 g (see `foodLibrary.ts`).
 *
 * Pure CSS: the track holds the list twice and translates by half its
 * width, so the loop is seamless. Direction follows `dir` (see
 * `.mkt-marquee-track` in globals.css), the second row runs the other
 * way, and hovering pauses both. The duplicate copy is `aria-hidden` so
 * screen readers hear each dish once.
 */
export async function FoodLibraryMarquee() {
  const t = await getTranslations("home.library");
  const locale = await getLocale();
  const half = Math.ceil(FOOD_LIBRARY.length / 2);
  const rows = [FOOD_LIBRARY.slice(0, half), FOOD_LIBRARY.slice(half)];

  return (
    <section className="relative border-y border-divider bg-white/60 py-12 lg:py-16" aria-label={t("eyebrow")}>
      <Reveal className="mx-auto mb-8 max-w-3xl px-4 text-center">
        <p className="text-sm font-semibold text-mkt-emerald-deep">{t("eyebrow")}</p>
        <h2 className="mt-2 text-balance text-xl font-bold text-ink sm:text-2xl">{t("title")}</h2>
      </Reveal>

      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="mkt-marquee overflow-hidden">
            <div
              className="mkt-marquee-track gap-3 pe-3"
              data-reverse={i === 1 ? "" : undefined}
              style={{ "--marquee-duration": i === 0 ? "70s" : "85s" } as React.CSSProperties}
            >
              {[false, true].map((duplicate) => (
                <div key={String(duplicate)} className="flex shrink-0 gap-3" aria-hidden={duplicate || undefined}>
                  {row.map((food, j) => (
                    <Chip key={`${food.en}-${j}`} food={food} tone={TONES[(i + j) % TONES.length]} locale={locale} unit={t("kcalUnit")} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Chip({ food, tone, locale, unit }: { food: FoodEntry; tone: string; locale: string; unit: string }) {
  const primary = locale === "ar" ? food.ar : food.en;
  const secondary = locale === "ar" ? food.en : food.ar;

  return (
    <span className="inline-flex shrink-0 items-center gap-3 rounded-full border border-ink/[0.07] bg-white px-4 py-2 shadow-[0_1px_2px_rgba(11,46,48,0.04)] transition-colors hover:border-primary/30">
      <span className={`h-2 w-2 rounded-full ${tone}`} aria-hidden="true" />
      <span className="text-sm font-semibold text-ink">{primary}</span>
      <span className="text-xs text-ink-muted/80">{secondary}</span>
      <span className="mkt-nums rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-mkt-teal-deep">
        {food.kcal} <span className="font-normal text-ink-muted">{unit}</span>
      </span>
    </span>
  );
}

import { ArrowUpRight, PlayCircle, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroVisual } from "./HeroVisual";
import { SplitWords, countWords } from "./SplitWords";

/**
 * Product-led hero: a slow aurora of the brand's teal/mint behind a
 * centered headline that arrives word by word, then the product itself
 * — `HeroVisual`, a "live clinic" dashboard that tips into place in 3D
 * and keeps cycling through the platform's core loop (alert → reminder
 * → AI summary).
 *
 * Centered composition on purpose: it reads identically in RTL and LTR
 * (no photo with a fixed empty side to keep the copy on), and the visual
 * gets the full content width, which is where the persuasion happens on
 * a software landing page.
 *
 * The headline's emphasised word gets a hand-drawn underline that draws
 * itself in (SVG stroke, dash-offset animation) once the words have
 * landed. The word stagger is a single sequence across the three copy
 * runs, so `startIndex` carries the count forward from run to run.
 */
export async function Hero() {
  const t = await getTranslations("home.hero");
  const start = t("headlineStart");
  const highlight = t("headlineHighlight");
  const end = t("headlineEnd");
  const startCount = countWords(start);
  const totalWords = startCount + 1 + countWords(end);

  return (
    <section className="relative isolate overflow-hidden bg-canvas pt-32 lg:pt-44">
      {/* Aurora: three blurred brand-colored fields drifting on long, offset loops. */}
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 start-[-10%] h-[42rem] w-[42rem] rounded-full bg-mkt-glow/35 blur-3xl animate-aurora-a" />
        <div className="absolute -top-32 end-[-12%] h-[38rem] w-[38rem] rounded-full bg-mkt-sky/60 blur-3xl animate-aurora-b" />
        <div className="absolute top-[28rem] start-[30%] h-[30rem] w-[36rem] rounded-full bg-primary/15 blur-3xl animate-aurora-c" />
      </div>
      <div className="mkt-dots pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem]" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-canvas to-transparent" aria-hidden="true" />

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p
            className="mkt-word inline-flex items-center gap-2 rounded-full border border-mkt-mint-border bg-white/70 px-4 py-1.5 text-[13px] font-semibold text-mkt-teal-deep shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <Sparkles size={14} strokeWidth={2} className="text-mkt-mint" />
            {t("badge")}
          </p>

          <h1 className="mt-7 text-balance text-[2.25rem] font-extrabold leading-[1.18] text-ink sm:text-5xl lg:text-[64px] lg:leading-[1.1] ltr:tracking-[-0.02em]">
            <SplitWords text={start} startIndex={1} />{" "}
            <span className="relative inline-block whitespace-nowrap">
              <SplitWords
                text={highlight}
                startIndex={startCount + 1}
                className="bg-gradient-to-br from-primary via-mkt-teal-deep to-mkt-emerald bg-clip-text text-transparent"
              />
              <svg
                aria-hidden="true"
                viewBox="0 0 200 14"
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-x-0 -bottom-1.5 h-[0.35em] w-full text-mkt-mint motion-reduce:[&_path]:animate-none motion-reduce:[&_path]:[stroke-dashoffset:0]"
              >
                <path
                  d="M3 10.5C40 4 80 3 118 5.5c30 2 55 3.5 79 1.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray={100}
                  strokeDashoffset={100}
                  className="animate-[draw-line_1s_cubic-bezier(0.22,1,0.36,1)_1.1s_forwards]"
                  style={{ "--draw-length": 100 } as React.CSSProperties}
                />
              </svg>
            </span>{" "}
            <SplitWords text={end} startIndex={startCount + 2} />
          </h1>

          <p
            className="mkt-word mt-7 max-w-2xl text-pretty text-base leading-relaxed text-mkt-body sm:text-lg lg:text-xl lg:leading-[1.7]"
            style={{ "--i": totalWords + 2 } as React.CSSProperties}
          >
            {t("subheadline")}
          </p>

          <div
            className="mkt-word mt-9 flex flex-col items-center gap-3 sm:flex-row"
            style={{ "--i": totalWords + 5 } as React.CSSProperties}
          >
            <Link
              href="/register"
              className="group relative inline-flex h-13 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-br from-primary to-mkt-teal-deep px-7 text-base font-bold text-white shadow-brand transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_rgba(0,101,114,0.65)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <span className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100" aria-hidden="true" />
              {t("ctaPrimary")}
              <ArrowUpRight size={18} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex h-13 items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-6 text-base font-semibold text-mkt-teal-deep backdrop-blur transition-[background-color,border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <PlayCircle size={20} strokeWidth={1.75} className="text-mkt-jade" />
              {t("ctaSecondary")}
            </a>
          </div>

          <p
            className="mkt-word mt-5 text-[13px] font-medium text-ink-muted"
            style={{ "--i": totalWords + 7 } as React.CSSProperties}
          >
            {t("reassurance")}
          </p>
        </div>

        <HeroVisual />

        <div className="flex justify-center pb-6 pt-10 text-ink-muted/70" aria-hidden="true">
          <span className="flex flex-col items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <span className="flex h-9 w-5 items-start justify-center rounded-full border border-ink/15 p-1">
              <span className="block h-2 w-1 rounded-full bg-primary animate-scroll-hint" />
            </span>
            {t("scrollHint")}
          </span>
        </div>
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
import Image from "next/image";
import { Check, Languages, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * The small product illustrations inside the "why" bento cards. Each is
 * plain markup + CSS: bars grow, lines draw, rows rise — all keyed off
 * the surrounding `Reveal`'s `data-inview` (globals.css), so they play
 * exactly once, when their card scrolls in. Each capability card pairs
 * that live data with the designer's illustration for the feature
 * (`public/home/why/illo-*.webp`, restored at the user's request): the
 * illustration carries the warmth, the CSS part carries the product.
 * Illustrations blend with `mix-blend-multiply` and a radial mask so
 * their near-white crop background drops out against the panel.
 */

function Illo({ src, className = "" }: { src: string; className?: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={480}
      height={374}
      className={`h-auto shrink-0 mix-blend-multiply [mask-image:radial-gradient(ellipse_closest-side,black_60%,transparent)] ${className}`}
    />
  );
}

function Rise({ i, className = "", children }: { i: number; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`mkt-rise ${className}`} style={{ "--i": i } as CSSProperties}>
      {children}
    </div>
  );
}

export async function AiDraftVisual() {
  const t = await getTranslations("home.why.visual");
  const meals = [
    { name: "58%", sub: "36%", kcal: "310", tone: "bg-primary/70" },
    { name: "44%", sub: "28%", kcal: "180", tone: "bg-mkt-jade/60" },
    { name: "72%", sub: "40%", kcal: "540", tone: "bg-accent/70" },
    { name: "50%", sub: "32%", kcal: "480", tone: "bg-status-attention/60" },
  ];
  const macros = [
    { width: "82%", tone: "bg-primary" },
    { width: "92%", tone: "bg-accent" },
    { width: "64%", tone: "bg-status-attention" },
    { width: "48%", tone: "bg-mkt-jade" },
  ];

  return (
    <div className="relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4 sm:p-5">
      <Illo src="/home/why/illo-1.webp" className="mx-auto -my-2 w-44 sm:w-52" />
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink sm:text-sm">{t("draftLabel")}</span>
        <span className="relative flex h-10 w-10 items-center justify-center">
          <span
            className="absolute inset-0 rounded-full animate-orbit"
            style={{ background: "conic-gradient(from 0deg, transparent 0 60%, var(--color-accent) 85%, var(--color-mkt-glow) 100%)" }}
            aria-hidden="true"
          />
          <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-card">
            <Sparkles size={15} strokeWidth={2} />
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {meals.map(({ name, sub, kcal, tone }, i) => (
          <Rise key={i} i={i} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-card">
            <span className={`h-8 w-8 shrink-0 rounded-lg ${tone}`} />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="h-2.5 overflow-hidden rounded-full bg-divider">
                <span className="mkt-grow block h-full rounded-full bg-ink/20" style={{ width: name, "--grow-delay": `${0.25 + i * 0.1}s` } as CSSProperties} />
              </span>
              <span className="h-2 overflow-hidden rounded-full bg-divider">
                <span className="mkt-grow block h-full rounded-full bg-ink/10" style={{ width: sub, "--grow-delay": `${0.35 + i * 0.1}s` } as CSSProperties} />
              </span>
            </span>
            <span className="mkt-nums shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-bold text-mkt-teal-deep">{kcal}</span>
          </Rise>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="grid flex-1 grid-cols-4 gap-2">
          {macros.map(({ width, tone }, i) => (
            <span key={i} className="h-2 overflow-hidden rounded-full bg-divider">
              <span className={`mkt-grow block h-full rounded-full ${tone}`} style={{ width, "--grow-delay": `${0.6 + i * 0.08}s` } as CSSProperties} />
            </span>
          ))}
        </div>
        <Rise i={5} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-status-on-track-bg px-2.5 py-1 text-[11px] font-semibold text-status-on-track">
          <Check size={12} strokeWidth={3} />
          {t("draftStatus")}
        </Rise>
      </div>
    </div>
  );
}

export async function ClientsVisual() {
  const t = await getTranslations("home.why.visual");
  const avatars = ["from-primary to-mkt-teal-deep", "from-mkt-mint to-mkt-emerald", "from-status-attention to-mkt-amber", "from-mkt-sky to-primary", "from-mkt-glow to-accent"];
  const rows = ["bg-status-on-track", "bg-status-attention", "bg-status-on-track"];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4">
      <Illo src="/home/why/illo-2.webp" className="-my-3 w-28 sm:w-32" />
      <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2 rtl:space-x-reverse">
          {avatars.map((tone, i) => (
            <Rise key={i} i={i} className={`h-8 w-8 rounded-full bg-gradient-to-br ${tone} ring-2 ring-white`} />
          ))}
        </div>
        <div className="text-end">
          <div className="mkt-nums text-sm font-extrabold text-ink">{t("clientsLabel")}</div>
          <div className="text-[11px] font-semibold text-status-attention">{t("clientsSub")}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        {rows.map((dot, i) => (
          <Rise key={i} i={i + 5} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 shadow-card">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="h-2 flex-1 rounded-full bg-divider" style={{ maxWidth: `${70 - i * 12}%` }} />
            <span className="ms-auto h-2 w-6 rounded-full bg-divider" />
          </Rise>
        ))}
      </div>
      </div>
    </div>
  );
}

export async function FollowUpVisual() {
  const t = await getTranslations("home.why.visual");
  const rows: { key: "followUp" | "followDown" | "followStopped"; width: string; tone: string; text: string }[] = [
    { key: "followUp", width: "72%", tone: "bg-status-on-track", text: "text-status-on-track" },
    { key: "followDown", width: "18%", tone: "bg-status-attention", text: "text-status-attention" },
    { key: "followStopped", width: "10%", tone: "bg-status-late", text: "text-status-late" },
  ];

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4">
      <Illo src="/home/why/illo-3.webp" className="-my-3 w-28 sm:w-32" />
      <div className="min-w-0 flex-1">
      <div className="mb-3 text-xs font-bold text-ink">{t("followTitle")}</div>
      <div className="flex flex-col gap-2.5">
        {rows.map(({ key, width, tone, text }, i) => (
          <Rise key={key} i={i} className="text-start">
            <div className="mb-1 flex items-center justify-between text-[11px]">
              <span className={`font-semibold ${text}`}>{t(key)}</span>
              <span className="mkt-nums text-ink-muted">{width}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-divider">
              <div className={`mkt-grow h-full rounded-full ${tone}`} style={{ width, "--grow-delay": `${0.3 + i * 0.12}s` } as CSSProperties} />
            </div>
          </Rise>
        ))}
      </div>
      </div>
    </div>
  );
}

export async function AnalyticsVisual() {
  const t = await getTranslations("home.why.visual");

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4">
      <Illo src="/home/why/illo-4.webp" className="-my-3 w-24 sm:w-28" />
      <div className="min-w-0 flex-1">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold text-ink">{t("chartLabel")}</span>
        <span className="mkt-nums rounded-full bg-status-on-track-bg px-2 py-0.5 text-[11px] font-bold text-status-on-track">{t("chartDelta")}</span>
      </div>
      <svg viewBox="0 0 240 90" className="h-24 w-full rtl:-scale-x-100" aria-hidden="true">
        <defs>
          <linearGradient id="bento-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[20, 45, 70].map((y) => (
          <line key={y} x1="0" x2="240" y1={y} y2={y} stroke="var(--color-divider)" strokeWidth="1" />
        ))}
        <path d="M4 22 C 40 26, 60 40, 88 42 S 140 48, 168 60 S 214 70, 236 72 L 236 90 L 4 90 Z" fill="url(#bento-area)" />
        <path
          d="M4 22 C 40 26, 60 40, 88 42 S 140 48, 168 60 S 214 70, 236 72"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2.5"
          strokeLinecap="round"
          pathLength={100}
          className="mkt-draw"
          style={{ "--draw-length": 100 } as CSSProperties}
        />
        <circle cx="236" cy="72" r="4" fill="var(--color-accent)" stroke="white" strokeWidth="2" />
      </svg>
      </div>
    </div>
  );
}

export async function PrivacyVisual() {
  const t = await getTranslations("home.why.visual");

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4">
      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" aria-hidden="true" />
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:0.7s]" aria-hidden="true" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-mkt-teal-deep text-white shadow-brand">
          <ShieldCheck size={24} strokeWidth={1.75} />
        </span>
      </span>
      <div className="text-start">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-mkt-teal-deep shadow-card">
          <Lock size={11} strokeWidth={2.2} />
          {t("lockLabel")}
        </span>
        <div className="mt-2 flex gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Rise key={i} i={i} className="h-1.5 w-8 rounded-full bg-primary/25" />
          ))}
        </div>
      </div>
    </div>
  );
}

export async function LanguageVisual() {
  const t = await getTranslations("home.why.visual");

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-divider bg-gradient-to-b from-canvas to-white p-4">
      <div className="relative flex rounded-full bg-white p-1 shadow-card">
        <span className="rounded-full bg-gradient-to-br from-primary to-mkt-teal-deep px-3 py-1.5 text-xs font-bold text-white">{t("langAr")}</span>
        <span className="px-3 py-1.5 text-xs font-semibold text-ink-muted">{t("langEn")}</span>
      </div>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-mkt-mint-bg text-mkt-emerald-deep">
        <Languages size={20} strokeWidth={1.75} />
      </span>
    </div>
  );
}

"use client";

import { BarChart3, BellRing, Lock, UtensilsCrossed, Users, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

/**
 * The "dual device" product mockup from the Figma "how it works" section
 * (node 49:3) — a desktop SaaS frame (patient bar, 3 metric tiles, meal
 * suggestion) with its right-side nav rail, plus a client-app preview
 * card that overlaps its bottom edge. Illustrative data (fictional
 * clinic/client names), same convention as the Stitch dashboard mockups
 * used elsewhere. Every color is a PRD §5.1 token.
 *
 * This used to live in `Hero.tsx` — moved here because in the Figma file
 * it sits below the hero's own photo background (y 896-1470 on the
 * 1440-wide frame, vs. the hero photo's own y 0-842), as this section's
 * lead visual, not the hero's.
 */
export function HowItWorksMockup() {
  const m = useTranslations("home.howItWorks.mockup");

  return (
    <div className="relative mx-auto mb-12">
      {/* Desktop SaaS frame */}
      <div className="rounded-card border border-border bg-card p-3 shadow-float sm:p-5">
        <div className="mb-4 flex items-center justify-between rounded-control bg-canvas px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-status-late/70" />
            <span className="h-3 w-3 rounded-full bg-status-attention/70" />
            <span className="h-3 w-3 rounded-full bg-status-on-track/70" />
          </div>
          <div className="hidden items-center gap-1.5 rounded bg-card px-3 py-1 text-xs text-ink-muted sm:flex">
            <Lock size={12} />
            <span dir="ltr">{m("chromeUrl")}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-ink-muted">
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="hidden sm:inline">{m("clinicName")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 text-start md:grid-cols-12">
          <div className="hidden flex-col gap-1.5 rounded-control bg-canvas/60 p-2.5 md:col-span-3 md:flex">
            <div className="flex items-center gap-2 rounded-control bg-primary/10 p-2 text-sm font-semibold text-primary">
              <Users size={17} strokeWidth={1.75} />
              <span>{m("navPatients")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-control p-2 text-sm text-ink-muted">
              <UtensilsCrossed size={17} strokeWidth={1.75} />
              <span>{m("navLibrary")}</span>
            </div>
            <div className="flex items-center gap-2 rounded-control p-2 text-sm text-ink-muted">
              <BellRing size={17} strokeWidth={1.75} />
              <span className="flex-1">{m("navAlerts")}</span>
              <span className="rounded-full bg-status-late-bg px-1.5 py-0.5 text-xs text-status-late">3</span>
            </div>
            <div className="flex items-center gap-2 rounded-control p-2 text-sm text-ink-muted">
              <BarChart3 size={17} strokeWidth={1.75} />
              <span>{m("navReports")}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:col-span-9">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-control bg-canvas/50 p-2.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent-active">
                  {m("patientName").charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-ink">{m("patientName")}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent-active">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {m("patientAdherent")}
                    </span>
                  </div>
                  <span className="text-xs text-ink-muted">{m("patientGoal")}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="rounded-control bg-card px-2.5 py-1.5 text-ink">{m("actionEdit")}</span>
                <span className="rounded-control bg-accent px-2.5 py-1.5 font-medium text-ink">
                  {m("actionWhatsapp")}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <MetricTile
                label={m("metricCalories")}
                value="1,650"
                unit={m("metricCaloriesUnit")}
                valueClass="text-primary"
                barClass="bg-primary"
                width="88%"
              />
              <MetricTile
                label={m("metricProtein")}
                value="118g"
                unit={m("metricProteinUnit")}
                valueClass="text-accent-active"
                barClass="bg-accent"
                width="98%"
              />
              <MetricTile
                label={m("metricResponse")}
                value={m("metricResponseValue")}
                unit={m("metricResponseSub")}
                valueClass="text-status-attention"
                barClass="bg-status-attention"
                width="85%"
              />
            </div>

            <div className="rounded-control bg-canvas/40 p-2.5">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-bold text-ink">{m("mealTitle")}</span>
                <span className="text-xs text-primary">{m("mealKcal")}</span>
              </div>
              <div className="flex items-center justify-between rounded-control bg-card p-2.5 shadow-card">
                <div className="flex items-center gap-2.5">
                  <UtensilsCrossed size={20} strokeWidth={1.75} className="text-accent-active" />
                  <div>
                    <div className="text-sm font-bold text-ink">{m("mealName")}</div>
                    <div className="text-xs text-ink-muted">{m("mealAlt")}</div>
                  </div>
                </div>
                <span className="shrink-0 rounded bg-canvas px-2 py-1 text-xs font-medium text-ink">
                  {m("mealLogged")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlapping client-app preview card */}
      <div className="animate-float absolute -bottom-8 start-4 hidden w-64 rounded-card border border-border bg-card p-4 shadow-float lg:block">
        <div className="mb-2.5 flex items-center justify-between rounded-control bg-canvas/60 p-2 text-xs text-ink-muted">
          <span>{m("mobileTime")}</span>
          <span className="font-bold text-primary">{m("mobileHeader")}</span>
          <Wifi size={14} className="text-accent" />
        </div>
        <div className="flex flex-col gap-1.5 text-start">
          <MobileRow done label={m("mobileBreakfast")} value={m("mobileBreakfastKcal")} />
          <MobileRow done label={m("mobileSnack")} value={m("mobileSnackKcal")} />
          <div className="flex items-center justify-between rounded-control bg-primary/10 p-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 rounded bg-card" />
              <span className="text-xs font-bold text-ink">{m("mobileLunch")}</span>
            </div>
            <span className="text-xs font-bold text-primary">{m("mobileLunchPending")}</span>
          </div>
          <div className="mt-1 rounded-control bg-accent/10 p-2 text-center text-xs text-accent-active">
            {"\u{1F4A7}"} {m("mobileWater")}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  unit,
  valueClass,
  barClass,
  width,
}: {
  label: string;
  value: string;
  unit: string;
  valueClass: string;
  barClass: string;
  width: string;
}) {
  return (
    <div className="rounded-control bg-card p-2.5 shadow-card">
      <span className="text-xs text-ink-muted">{label}</span>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-lg font-bold ${valueClass}`}>{value}</span>
        <span className="text-xs text-ink-muted">{unit}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas">
        <div className={`h-full rounded-full ${barClass}`} style={{ width }} />
      </div>
    </div>
  );
}

function MobileRow({ done, label, value }: { done: boolean; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-control bg-canvas/40 p-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-4 w-4 items-center justify-center rounded text-[10px] ${
            done ? "bg-accent/20 text-accent-active" : "bg-card"
          }`}
        >
          {done ? "✓" : ""}
        </span>
        <span className="text-xs font-medium text-ink">{label}</span>
      </div>
      <span className="text-xs text-ink-muted">{value}</span>
    </div>
  );
}

"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Activity, AlertTriangle, HelpCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { checkFoodAllergens } from "@/lib/mealPlans/api";
import type { AllergenSeverity, FoodAllergenCheck } from "@/lib/mealPlans/types";

/**
 * Pilot feedback 2, A5: what the patient is approved to avoid, asked of the
 * SERVER (POST …/allergen-check) rather than re-implemented here, for every
 * food the designer is showing — including a food just picked, or swapped
 * in, that is not saved yet. The warning therefore appears before the save,
 * and can never disagree with the plan report the server returns after it.
 *
 * One cache for the whole designer: the rows, the alternatives and the
 * autocomplete all read and fill the same map.
 */
type Checks = Record<number, FoodAllergenCheck>;

type AllergenContextValue = {
  checks: Checks;
  /** Fetches any of these foods not already known. Safe to call with ids it has. */
  request: (foodIds: number[]) => Promise<void>;
};

const AllergenContext = createContext<AllergenContextValue>({ checks: {}, request: async () => {} });

export const useAllergenChecks = () => useContext(AllergenContext);

const CHUNK = 50; // the API's per-call cap

export function AllergenChecksProvider({ subscriberId, children }: { subscriberId: string; children: ReactNode }) {
  const { authorizedFetch } = useAuth();
  const [checks, setChecks] = useState<Checks>({});
  // Ids already asked for (answered or in flight), so a re-render never re-asks.
  const asked = useRef<Set<number>>(new Set());

  const request = useCallback(
    async (foodIds: number[]) => {
      const missing = [...new Set(foodIds)].filter((id) => !asked.current.has(id));
      if (missing.length === 0) return;
      missing.forEach((id) => asked.current.add(id));

      for (let i = 0; i < missing.length; i += CHUNK) {
        const ids = missing.slice(i, i + CHUNK);
        const result = await checkFoodAllergens(authorizedFetch, subscriberId, ids);

        if (!result.ok) {
          // Let a later render try again rather than caching "no answer" as "safe".
          ids.forEach((id) => asked.current.delete(id));
          continue;
        }

        setChecks((prev) => ({ ...prev, ...Object.fromEntries(result.data.foods.map((f) => [f.food_id, f])) }));
      }
    },
    [authorizedFetch, subscriberId]
  );

  const value = useMemo(() => ({ checks, request }), [checks, request]);

  return <AllergenContext.Provider value={value}>{children}</AllergenContext.Provider>;
}

/** The strongest conflict among these foods, for a row that has an item and its alternatives. */
export function worstSeverity(checks: Checks, foodIds: number[]): AllergenSeverity | null {
  const rank: Record<AllergenSeverity, number> = { avoid: 1, intolerance: 2, confirmed_allergy: 3 };
  let best: AllergenSeverity | null = null;

  for (const id of foodIds) {
    const severity = checks[id]?.conflict?.severity;
    if (severity && (best === null || rank[severity] > rank[best])) best = severity;
  }

  return best;
}

/**
 * The inline warning for ONE food: red for a confirmed allergy, amber for an
 * intolerance or a food to avoid. Renders nothing for a clean food.
 *
 * A food whose allergens were never tagged gets a muted line instead: it is
 * unknown, not safe, and saying nothing would read as safe.
 */
export function AllergenNotice({ check, compact = false }: { check: FoodAllergenCheck | undefined; compact?: boolean }) {
  return (
    <>
      <AllergenLine check={check} compact={compact} />
      <NutritionLines check={check} compact={compact} />
    </>
  );
}

/**
 * Clinical batch 1, E4: amber GI / sodium notes for a REVIEWED food, only for
 * the patient's matching condition (the server decides; an unreviewed food
 * arrives with none). Never blocking, and no "unknown" noise.
 */
function NutritionLines({ check, compact }: { check: FoodAllergenCheck | undefined; compact: boolean }) {
  const t = useTranslations("nutritionWarning");

  return (
    <>
      {(check?.nutrition_warnings ?? []).map((w) => (
        <p
          key={w.type}
          role="note"
          className={`flex items-start gap-1.5 rounded-md bg-status-attention-bg px-2 py-1 text-xs font-medium text-status-attention ${compact ? "" : "mt-1"}`}
        >
          <Activity size={13} className="mt-px shrink-0" aria-hidden="true" />
          <span>{w.type === "gi" ? t("gi", { gi: w.gi }) : t("sodium", { value: w.sodium_mg_per_100g })}</span>
        </p>
      ))}
    </>
  );
}

function AllergenLine({ check, compact = false }: { check: FoodAllergenCheck | undefined; compact?: boolean }) {
  const t = useTranslations("allergenWarning");
  const tGroup = useTranslations("healthRecords.group");

  if (!check) return null;

  if (check.conflict) {
    const { severity, groups, match } = check.conflict;
    const red = severity === "confirmed_allergy";
    const Icon = red ? ShieldAlert : AlertTriangle;
    // A name match on an "other" allergy is a hint, not a tag: say what it is.
    const what =
      match === "text" && groups.every((g) => g === "other")
        ? t("otherMatch")
        : t("contains", { groups: groups.map((g) => tGroup(g)).join("، ") });

    return (
      <p
        role={red ? "alert" : "note"}
        className={`flex items-start gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
          red ? "bg-status-late-bg text-status-late" : "bg-status-attention-bg text-status-attention"
        } ${compact ? "" : "mt-1"}`}
      >
        <Icon size={13} className="mt-px shrink-0" aria-hidden="true" />
        <span>
          {what} — {t(severity)}
        </span>
      </p>
    );
  }

  if (check.unverified) {
    return (
      <p className="flex items-start gap-1.5 px-1 text-xs text-ink-muted">
        <HelpCircle size={12} className="mt-px shrink-0" aria-hidden="true" />
        {t("unverified")}
      </p>
    );
  }

  return null;
}

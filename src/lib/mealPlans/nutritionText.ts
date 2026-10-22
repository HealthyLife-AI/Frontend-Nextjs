/**
 * The one wording of a glycemic / sodium warning. The row badge (planned items
 * AND alternatives), the food picker and the plan-level list all call this,
 * so what a row says can never differ from the list: the server decides the
 * type, this only words it.
 *
 *   gi    → high index only
 *   gl    → high load only (index not high)
 *   gi_gl → both, in one line
 */
export type GlycemicText = {
  type: "gi" | "gl" | "gi_gl" | "sodium";
  gi?: number;
  gl?: number | null;
  sodium_mg_per_100g?: number;
};

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** One decimal, as the load is shown everywhere (20.7, 43.2). */
export const formatLoad = (gl: number | null | undefined) => (gl === null || gl === undefined ? "" : Number(gl).toFixed(1));

export function nutritionMessage(t: Translate, w: GlycemicText): string {
  switch (w.type) {
    case "sodium":
      return t("sodium", { value: w.sodium_mg_per_100g ?? 0 });
    case "gl":
      return t("glOnly", { gl: formatLoad(w.gl) });
    case "gi_gl":
      return t("giGl", { gi: w.gi ?? 0, gl: formatLoad(w.gl) });
    default:
      return t("gi", { gi: w.gi ?? 0 });
  }
}

import type { ReactNode } from "react";

type Variant = "list" | "detail" | "form";

const VARIANTS: Record<Variant, string> = {
  list: "",
  detail: "",
  // A form's line length, not the column's: fields wider than this are harder to scan.
  form: "max-w-[720px]",
};

/**
 * The outer column of a dashboard page. Pages used to cap themselves at
 * `max-w-xl`…`max-w-6xl` one by one, so at 1366px several filled barely half
 * of the ~1014px content area. Now the width is a property of the page's
 * kind, not of the page:
 * - `list`: a list or grid that should use the whole column.
 * - `detail`: one record's page (patient, plan designer); whole column too.
 * - `form`: a single form; capped so its fields keep a readable width.
 * Always start-aligned (design-system-rules §0, dashboard addendum).
 */
export function PageContainer({ variant, children }: { variant: Variant; children: ReactNode }) {
  return <div className={`flex w-full flex-col gap-6 ${VARIANTS[variant]}`}>{children}</div>;
}

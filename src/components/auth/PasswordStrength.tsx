import { useTranslations } from "next-intl";

/**
 * Live strength meter under the register/reset password fields, scored
 * against the same policy the API enforces (RegisterNutritionistRequest:
 * min 8, mixed case, a number) plus length and symbols for the top band.
 * Purely advisory — the API remains the authority.
 */
export function PasswordStrength({ value }: { value: string }) {
  const t = useTranslations("auth.strength");
  const score = scorePassword(value);
  const bands = [
    { key: "weak", tone: "bg-status-late" },
    { key: "fair", tone: "bg-status-attention" },
    { key: "good", tone: "bg-accent" },
    { key: "strong", tone: "bg-primary" },
  ] as const;
  const band = bands[Math.max(0, score - 1)] ?? bands[0];

  if (!value) return null;

  return (
    <div className="flex flex-col gap-1.5" aria-live="polite">
      <div className="flex gap-1.5" aria-hidden="true">
        {bands.map((b, i) => (
          <span key={b.key} className="h-1.5 flex-1 overflow-hidden rounded-full bg-divider">
            <span className={`block h-full rounded-full transition-[width,background-color] duration-500 ${i < score ? band.tone : ""}`} style={{ width: i < score ? "100%" : "0%" }} />
          </span>
        ))}
      </div>
      <span className="text-xs text-ink-muted">
        {t("label")} <span className="font-semibold text-ink">{t(band.key)}</span>
      </span>
    </div>
  );
}

/** 0–4. Reaches 3 exactly when the API's policy is satisfied. */
export function scorePassword(value: string): number {
  if (!value) return 0;
  const policy = value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /\d/.test(value);
  if (policy && value.length >= 12 && /[^A-Za-z0-9]/.test(value)) return 4;
  if (policy) return 3;
  const checks = [value.length >= 8, /[a-z]/.test(value) && /[A-Z]/.test(value), /\d/.test(value)].filter(Boolean).length;
  return Math.max(1, checks);
}

import { ShieldCheck, Users, Languages, UtensilsCrossed } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const SHOWCASE_POINTS = [
  { icon: Users, key: "point1" as const },
  { icon: ShieldCheck, key: "point2" as const },
  { icon: Languages, key: "point3" as const },
];

/**
 * Split-screen auth shell (login/register/activate all mount here).
 * The brand panel is new chrome, not a new identity: every color on it
 * is one of the PRD §5.1 tokens (primary/accent/ink), just composed into
 * a gradient + copy instead of a flat teal wordmark on empty canvas. Copy
 * is drawn from real PRD facts (the positioning line, the 40–60% admin-
 * time stat, BR-2 isolation, RTL+EN) — a value-prop panel, not invented
 * marketing claims.
 *
 * Hidden below `lg:` rather than stacked above the form: the form is
 * what a returning user on a phone actually needs first, and stacking a
 * full-height panel above it would push the email field below the fold.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("common");
  const tShowcase = await getTranslations("auth.showcase");

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="relative hidden w-[42%] max-w-xl shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-ink p-10 text-card lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
          aria-hidden="true"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-control bg-card/15">
            <UtensilsCrossed size={19} strokeWidth={1.75} />
          </div>
          <span className="text-lg font-semibold">{t("brandName")}</span>
        </div>

        <div className="relative flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="text-2xl font-semibold leading-snug">{tShowcase("headline")}</h2>
            <p className="text-sm leading-relaxed text-card/80">{tShowcase("body")}</p>
          </div>

          <div className="flex flex-col gap-5">
            {SHOWCASE_POINTS.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-card/15">
                  <Icon size={18} strokeWidth={1.75} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{tShowcase(`${key}Title`)}</span>
                  <span className="text-sm text-card/70">{tShowcase(`${key}Body`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative" />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <span className="text-lg font-semibold text-primary lg:hidden">{t("brandName")}</span>
          <LocaleSwitcher />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-md rounded-card border border-border bg-card p-8 shadow-card">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

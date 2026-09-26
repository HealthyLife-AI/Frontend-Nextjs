import Image from "next/image";
import { ShieldCheck, Users, Languages } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

const SHOWCASE_POINTS = [
  { icon: Users, key: "point1" as const },
  { icon: ShieldCheck, key: "point2" as const },
  { icon: Languages, key: "point3" as const },
];

/**
 * Split-screen auth shell (login/register/activate all mount here), in
 * the landing page's identity: the brand panel is the landing CTA's
 * nutritionist photo (`/home/cta-bg.webp`) under a deep-teal gradient,
 * with the value points in a frosted card; the form side carries the
 * real HealthyLife logo and the same mint glows the marketing page uses.
 * Copy is drawn from real PRD facts (positioning line, the 40–60% admin-
 * time stat, BR-2 isolation, RTL+EN).
 *
 * The brand panel is hidden below `lg:` rather than stacked above the
 * form: on a phone the form is what a returning user needs first.
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
      <div className="relative isolate m-3 hidden w-[46%] max-w-2xl shrink-0 flex-col justify-end overflow-hidden rounded-[28px] p-10 text-white lg:flex">
        <Image
          src="/home/cta-bg.webp"
          alt=""
          fill
          priority
          sizes="46vw"
          className="-z-20 object-cover object-[20%_center]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-t from-mkt-dark-bg via-mkt-teal-deep/80 to-mkt-teal-deep/10"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-mkt-mint" aria-hidden="true" />
              {t("brandFull")}
            </span>
            <h2 className="text-[28px] font-extrabold leading-snug">{tShowcase("headline")}</h2>
            <p className="text-[15px] leading-relaxed text-white/80">{tShowcase("body")}</p>
          </div>

          <div className="flex flex-col gap-4 rounded-[22px] border border-white/15 bg-white/10 p-5 backdrop-blur-md">
            {SHOWCASE_POINTS.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white/15 text-mkt-mint">
                  <Icon size={19} strokeWidth={1.9} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold">{tShowcase(`${key}Title`)}</span>
                  <span className="text-sm text-white/70">{tShowcase(`${key}Body`)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden">
        <div className="pointer-events-none absolute -top-32 end-[-8rem] h-96 w-96 rounded-full bg-mkt-mint/15 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-40 start-[-6rem] h-96 w-96 rounded-full bg-mkt-sky/30 blur-3xl" aria-hidden="true" />

        <div className="relative flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, fixed-aspect wordmark */}
            <img src="/home/logo.png" alt={t("brandFull")} className="h-16 w-auto" />
          </Link>
          <LocaleSwitcher />
        </div>

        <div className="relative flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-[440px] rounded-[26px] border border-border/60 bg-white/85 p-8 shadow-panel backdrop-blur-xl sm:p-10">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

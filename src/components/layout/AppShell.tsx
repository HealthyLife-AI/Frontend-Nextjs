"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * The one shared shell every dashboard role mounts (dashboard-builder
 * Step 1: "one component, parameterized by role" — the `user` prop is
 * that parameterization point; a future client/admin dashboard reuses
 * this same shell rather than forking it).
 *
 * Below `lg:`, the sidebar becomes an off-canvas drawer (dashboard-builder
 * Step 1: "persistent sidebar at desktop width, off-canvas drawer below
 * it") — `mobileNavOpen` is owned here since both Header (the toggle)
 * and Sidebar (the drawer + backdrop) need it.
 *
 * `src/proxy.ts` already blocks a request with no refresh-token
 * cookie before it ever reaches this component. This effect is the
 * second half of that gate: it catches the case the cookie check can't
 * (a cookie that exists but the API rejects — expired, revoked, reused),
 * which only surfaces once AuthProvider's silent refresh resolves to
 * `unauthenticated` client-side.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("common");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
        {/* eslint-disable-next-line @next/next/no-img-element -- brand logo */}
        <img src="/home/logo.png" alt="" className="h-20 w-auto animate-pulse" />
        <span className="text-sm text-ink-muted">{t("loading")}</span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Faint brand glow in the content area's top corner — the landing page's mint blobs, toned down for a work surface. */}
      <div
        className="pointer-events-none fixed -top-40 end-[-10rem] -z-0 h-[28rem] w-[28rem] rounded-full bg-mkt-mint/10 blur-3xl"
        aria-hidden="true"
      />
      <Sidebar user={user} open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <Header onMenuClick={() => setMobileNavOpen(true)} />
      <main className="relative min-h-screen pt-[72px] lg:ps-72">
        <div key={pathname} className="animate-page-in mx-auto flex w-full max-w-7xl flex-col gap-7 p-4 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

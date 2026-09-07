import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/useRouter/usePathname/redirect — every internal link
// and programmatic navigation in the app must go through these, never
// next/link or next/navigation directly, or the locale prefix gets lost.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);

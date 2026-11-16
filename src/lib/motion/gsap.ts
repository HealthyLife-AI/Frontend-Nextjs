import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one place ScrollTrigger is registered. Every homepage motion
 * component imports `gsap` and `ScrollTrigger` from here instead of from
 * the package, so the plugin can never be used before it is registered
 * (GSAP's most common silent failure) and so there is exactly one GSAP
 * instance on the page — `SmoothScroll` drives Lenis off this instance's
 * ticker, and a second copy would tick independently.
 *
 * Client components are rendered on the server too, where ScrollTrigger
 * has no document to attach to, hence the `window` guard.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

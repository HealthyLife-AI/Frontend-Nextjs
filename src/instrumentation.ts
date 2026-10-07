import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry";

// Server (Node and edge) errors. A no-op without NEXT_PUBLIC_SENTRY_DSN.
export function register() {
  Sentry.init(sentryOptions);
}

export const onRequestError = Sentry.captureRequestError;

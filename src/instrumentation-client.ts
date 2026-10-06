import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry";

// Browser errors. A no-op without NEXT_PUBLIC_SENTRY_DSN.
Sentry.init(sentryOptions);

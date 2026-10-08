import type { Breadcrumb, ErrorEvent } from "@sentry/nextjs";

/**
 * Shared Sentry options for the browser and the server. Off unless
 * NEXT_PUBLIC_SENTRY_DSN is set. No PII: no IP, cookies or headers, and
 * health data never leaves in a breadcrumb or request body.
 */
export const sentryOptions = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || undefined,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
  sendDefaultPii: false,
  tracesSampleRate: 0,
  beforeSend: scrub,
  beforeBreadcrumb: dropCredentials,
};

/** A patient's generated password only ever sits in a wa.me link: no breadcrumb may carry one. */
export function dropCredentials(breadcrumb: Breadcrumb): Breadcrumb | null {
  return /wa\.me|password|reset-password/i.test(JSON.stringify(breadcrumb)) ? null : breadcrumb;
}

const SECRET = /(token|password|authorization|cookie|secret)/i;

export function scrub(event: ErrorEvent): ErrorEvent {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.headers;
    delete event.request.data;
    if (event.request.url) event.request.url = event.request.url.split("?")[0];
    delete event.request.query_string;
  }
  event.breadcrumbs = event.breadcrumbs?.map((b) => {
    const data = b.data ? Object.fromEntries(Object.entries(b.data).filter(([k]) => !SECRET.test(k) && k !== "body")) : undefined;
    const url = typeof data?.url === "string" ? data.url.split("?")[0] : data?.url;
    return { ...b, data: data ? { ...data, url } : undefined };
  });
  return event;
}

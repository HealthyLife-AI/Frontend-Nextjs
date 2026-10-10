import { type Fetcher, parseJson } from "@/lib/api";

/** Mirrors API_CONTRACT.md "Appointments (Phase 2, Step 2)". */

export type AppointmentType = "follow_up" | "results_review" | "quick_consult";
export type AppointmentStatus = "booked" | "cancelled" | "completed" | "no_show";

export type Appointment = {
  id: number;
  type: AppointmentType;
  channel: "whatsapp" | "phone" | "video";
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  topics: string[];
  note: string | null;
  cancelled_by: "patient" | "nutritionist" | "system" | null;
  cancel_reason: string | null;
  meeting_link: string | null;
  patient?: { id: number; name: string | null; code: string | null };
};

export type AvailabilityWindow = { weekday: number; start: string; end: string };
export type Availability = { timezone: string; windows: AvailabilityWindow[]; days_off: string[]; meeting_link: string | null };

const json = (method: string, body?: unknown): RequestInit => ({ method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });

export const listAppointments = (f: Fetcher, from: string, to: string) => f(`/appointments?from=${from}&to=${to}`).then((r) => parseJson<Appointment[]>(r));
export const cancelAppointment = (f: Fetcher, id: number, reason: string | null) => f(`/appointments/${id}/cancel`, json("POST", { reason })).then((r) => parseJson<Appointment>(r));
export const closeAppointment = (f: Fetcher, id: number, as: "complete" | "no-show") => f(`/appointments/${id}/${as}`, json("POST")).then((r) => parseJson<Appointment>(r));
export type SlotsResponse = { type: AppointmentType; duration_minutes: number; timezone: string; video_available: boolean; days: { date: string; times: string[] }[] };

/** B9: free times to move this appointment to (no 12-hour lead for the nutritionist). */
export const getRescheduleSlots = (f: Fetcher, id: number) => f(`/appointments/${id}/slots`).then((r) => parseJson<SlotsResponse>(r));
export const rescheduleAppointment = (f: Fetcher, id: number, startsAt: string) => f(`/appointments/${id}`, json("PATCH", { starts_at: startsAt })).then((r) => parseJson<Appointment>(r));
/** One patient's appointments (patient page). */
export const listPatientAppointments = (f: Fetcher, subscriberId: number | string, from: string, to: string) => f(`/appointments?subscriber_id=${subscriberId}&from=${from}&to=${to}`).then((r) => parseJson<Appointment[]>(r));
export const getAvailability = (f: Fetcher) => f("/me/availability").then((r) => parseJson<Availability>(r));
export const saveAvailability = (f: Fetcher, a: Omit<Availability, "timezone">) => f("/me/availability", json("PUT", a)).then((r) => parseJson<Availability>(r));
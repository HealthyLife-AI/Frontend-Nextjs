import type {
  BodyCompositionReading,
  Client,
  ClientListResponse,
  DashboardOverview,
  HealthProfile,
} from "./types";

import { type Fetcher, parseJson } from "@/lib/api";

// Re-exported for the components that already import it from here.
export type { ApiError } from "@/lib/api";

export function listClients(
  fetcher: Fetcher,
  params: { status?: string; adherence?: string; search?: string; page?: number; archived?: boolean; pendingProposals?: boolean }
) {
  const query = new URLSearchParams();
  if (params.archived) query.set("archived", "1");
  if (params.pendingProposals) query.set("pending_proposals", "1");
  if (params.status) query.set("status", params.status);
  if (params.adherence) query.set("adherence", params.adherence);
  if (params.search) query.set("search", params.search);
  if (params.page && params.page > 1) query.set("page", String(params.page));

  const qs = query.toString();

  return fetcher(`/clients${qs ? `?${qs}` : ""}`).then((res) => parseJson<ClientListResponse>(res));
}

export function getDashboardOverview(fetcher: Fetcher) {
  return fetcher("/dashboard/overview").then((res) => parseJson<DashboardOverview>(res));
}

/** The username and generated password, returned only by the call that made them. */
export type PatientCredentials = { username: string; password: string };

export function createClient(
  fetcher: Fetcher,
  payload: { name: string; phone: string; username: string; goal: string }
) {
  return fetcher("/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<{ client: Client; credentials: PatientCredentials }>(res));
}

export function getClient(fetcher: Fetcher, id: number | string) {
  return fetcher(`/clients/${id}`).then((res) => parseJson<Client>(res));
}

/** Permanently removes the client and everything recorded about them (204). */
export function deleteClient(fetcher: Fetcher, id: number | string) {
  return fetcher(`/clients/${id}`, { method: "DELETE" }).then((res) => parseJson<null>(res));
}

/** End follow-up: hidden from the roster and jobs, records kept read-only. */
export function archiveClient(fetcher: Fetcher, id: number | string) {
  return fetcher(`/clients/${id}/archive`, { method: "POST" }).then((res) => parseJson<{ client: Client }>(res));
}

/** Resume follow-up. No invite any more: the patient signs in with the credentials they have. */
export function resumeClient(fetcher: Fetcher, id: number | string) {
  return fetcher(`/clients/${id}/resume`, { method: "POST" }).then((res) => parseJson<{ client: Client }>(res));
}

/**
 * A new generated password (and the username, required when the patient has
 * none yet). Every session of the patient ends.
 */
export function resetPatientPassword(fetcher: Fetcher, id: number | string, username?: string) {
  return fetcher(`/clients/${id}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(username ? { username } : {}),
  }).then((res) => parseJson<PatientCredentials>(res));
}

export function getHealthProfile(fetcher: Fetcher, subscriberId: number | string) {
  return fetcher(`/clients/${subscriberId}/health-profile`).then(async (res) => {
    if (res.status === 204) return { ok: true as const, data: null };
    return parseJson<HealthProfile>(res);
  });
}

export function saveHealthProfile(
  fetcher: Fetcher,
  subscriberId: number | string,
  payload: Record<string, unknown>
) {
  return fetcher(`/clients/${subscriberId}/health-profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<HealthProfile>(res));
}

export function addBodyCompositionReading(
  fetcher: Fetcher,
  subscriberId: number | string,
  payload: Record<string, unknown>
) {
  return fetcher(`/clients/${subscriberId}/body-composition-readings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<BodyCompositionReading>(res));
}

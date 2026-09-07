import type {
  BodyCompositionReading,
  Client,
  ClientListResponse,
  DashboardOverview,
  HealthProfile,
} from "./types";

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

export type ApiError = { message: string; errors?: Record<string, string[]> };

async function parseJson<T>(res: Response): Promise<{ ok: true; data: T } | { ok: false; error: ApiError; status: number }> {
  const body = await res.json().catch(() => null);

  if (!res.ok) {
    return { ok: false, status: res.status, error: body ?? { message: "Something went wrong." } };
  }

  return { ok: true, data: body as T };
}

export function listClients(
  fetcher: Fetcher,
  params: { status?: string; adherence?: string; search?: string; page?: number }
) {
  const query = new URLSearchParams();
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

export function createClient(
  fetcher: Fetcher,
  payload: { name: string; phone: string; goal: string }
) {
  return fetcher("/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => parseJson<{ client: Client; invite_token: string; invite_expires_at: string }>(res));
}

export function getClient(fetcher: Fetcher, id: number | string) {
  return fetcher(`/clients/${id}`).then((res) => parseJson<Client>(res));
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

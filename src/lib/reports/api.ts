import { type Fetcher, parseJson } from "@/lib/api";

/**
 * Phase 4, A: a patient's medical reports (nutritionist side). Behind a server
 * feature flag: while it is off every call answers 404 and the card is hidden.
 * A file is never reachable by URL: it is fetched with the session token and
 * shown from a short-lived blob.
 */
export type ReportCategory = "lab_test" | "imaging" | "prescription" | "medical_letter" | "other";

export type PatientReport = {
  id: number;
  category: ReportCategory;
  title: string;
  report_date: string | null;
  mime: string;
  size_bytes: number;
  pages: number | null;
  nutritionist_note: string | null;
  reviewed: boolean;
  reviewed_at: string | null;
  uploaded_at: string | null;
};

export const listReports = (f: Fetcher, id: string | number) => f(`/clients/${id}/reports`).then((r) => parseJson<PatientReport[]>(r));

export const updateReport = (f: Fetcher, id: string | number, reportId: number, body: { nutritionist_note?: string | null; reviewed?: boolean }) =>
  f(`/clients/${id}/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => parseJson<PatientReport>(r));

/** The decrypted file as a Blob, or null when it cannot be read. */
export async function fetchReportFile(f: Fetcher, id: string | number, reportId: number): Promise<Blob | null> {
  const res = await f(`/clients/${id}/reports/${reportId}/file`);

  return res.ok ? res.blob() : null;
}

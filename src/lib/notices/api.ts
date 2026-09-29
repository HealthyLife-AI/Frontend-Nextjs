import { type Fetcher, parseJson } from "@/lib/api";

/**
 * Mirrors `GET /notices` and `DELETE /notices/{id}` in API_CONTRACT.md
 * (BR-18): a patient deleted their own account. Only the patient's code and
 * the date survive the deletion, so that is all a notice carries.
 */
export type DeletionNotice = {
  id: number;
  patient_code: string;
  deleted_at: string;
};

export function listDeletionNotices(fetcher: Fetcher) {
  return fetcher("/notices").then((res) => parseJson<DeletionNotice[]>(res));
}

/** Dismissing removes the notice for good (204, no body). */
export async function dismissDeletionNotice(fetcher: Fetcher, id: number): Promise<boolean> {
  const res = await fetcher(`/notices/${id}`, { method: "DELETE" });

  return res.ok;
}

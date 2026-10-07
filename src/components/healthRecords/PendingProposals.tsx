"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ClipboardCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { decideProposal, getHealthRecords, type HealthRecords, type Proposal } from "@/lib/healthRecords/api";

/**
 * «بانتظار الاعتماد»: what the patient proposed for their goal, medications
 * or allergies. Nothing applies until approved here. Removing a confirmed
 * allergy is confirmed explicitly before it is approved.
 */
export function PendingProposals({ subscriberId, readOnly }: { subscriberId: string; readOnly: boolean }) {
  const t = useTranslations("healthRecords");
  const { authorizedFetch } = useAuth();
  const [records, setRecords] = useState<HealthRecords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deciding, setDeciding] = useState<{ proposal: Proposal; decision: "approve" | "reject" } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function reload() {
    const r = await getHealthRecords(authorizedFetch, subscriberId);
    if (r.ok) setRecords(r.data);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriberId]);

  if (!records || records.proposals.length === 0) return null;

  const allergyById = new Map(records.allergies.map((a) => [a.id, a]));
  const medById = new Map(records.medications.map((m) => [m.id, m]));

  function describe(p: Proposal): string {
    const data = (p.payload ?? {}) as Record<string, string | number | null>;
    if (p.kind === "goal") return t("proposal.goal", { goal: t(`goal.${data.goal_type}`) });
    if (p.kind === "medication") {
      const name = p.action === "add" ? String(data.name) : medById.get(p.target_id ?? 0)?.name ?? "—";
      return t(`proposal.medication_${p.action}`, { name, dose: String(data.dose ?? "") });
    }
    const current = allergyById.get(p.target_id ?? 0);
    const label = p.action === "remove" ? current?.label ?? "—" : data.group === "other" ? String(data.other_text) : t(`group.${data.group}`);
    return t(`proposal.allergy_${p.action}`, { name: label, class: data.class ? t(`class.${data.class}`) : "" });
  }

  const isRemovingConfirmed = (p: Proposal) => p.kind === "allergy" && p.action === "remove" && allergyById.get(p.target_id ?? 0)?.class === "confirmed_allergy";

  async function confirm() {
    if (!deciding) return;
    setBusy(true);
    const r = await decideProposal(authorizedFetch, subscriberId, deciding.proposal.id, deciding.decision, note.trim() || null);
    setBusy(false);
    if (!r.ok) {
      const code = (r.error as { code?: string }).code;
      setError(code === "proposal_stale" ? t("stale") : code === "follow_up_ended" ? t("ended") : t("saveFailed"));
    } else {
      setError(null);
    }
    setDeciding(null);
    setNote("");
    reload();
  }

  return (
    <section className="rounded-panel border border-status-attention/30 bg-status-attention-bg p-5">
      <h2 className="flex items-center gap-2 text-base font-bold text-ink">
        <ClipboardCheck size={18} className="text-status-attention" aria-hidden="true" />
        {t("pendingTitle", { count: records.proposals.length })}
      </h2>
      <p className="mt-0.5 text-xs text-ink-muted">{t("pendingHint")}</p>
      {error && <p role="alert" className="mt-3 text-sm text-status-late">{error}</p>}
      <ul className="mt-3 flex flex-col gap-2">
        {records.proposals.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 rounded-field bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink">{describe(p)}</p>
            {!readOnly && (
              <div className="flex shrink-0 gap-2">
                <Button variant="secondary" onClick={() => setDeciding({ proposal: p, decision: "reject" })}>
                  {t("reject")}
                </Button>
                <Button onClick={() => setDeciding({ proposal: p, decision: "approve" })}>{t("approve")}</Button>
              </div>
            )}
          </li>
        ))}
      </ul>

      <Dialog open={deciding !== null} onClose={() => setDeciding(null)} title={deciding?.decision === "approve" ? t("approveTitle") : t("rejectTitle")} busy={busy}>
        {deciding && (
          <div className="flex flex-col gap-4">
            <p className="text-sm text-ink">{describe(deciding.proposal)}</p>
            {deciding.decision === "approve" && isRemovingConfirmed(deciding.proposal) && (
              <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm font-semibold text-status-late">
                {t("confirmedRemovalWarning")}
              </p>
            )}
            <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
              {t("noteOptional")}
              <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} className="rounded-field border border-border bg-card p-3 text-sm outline-none focus:border-primary" />
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDeciding(null)} disabled={busy}>
                {t("cancel")}
              </Button>
              <Button onClick={confirm} isLoading={busy}>
                {deciding.decision === "approve" ? t("approve") : t("reject")}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}

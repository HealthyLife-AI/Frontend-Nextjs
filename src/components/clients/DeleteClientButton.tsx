"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { deleteClient } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";

/**
 * Permanently deletes a client (and, server-side, everything recorded
 * about them). Irreversible, so the confirm button only unlocks once the
 * client's name is typed exactly — a mis-click can't wipe a patient.
 */
export function DeleteClientButton({ client }: { client: Client }) {
  const t = useTranslations("clientsDelete");
  const { authorizedFetch } = useAuth();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trimmed and with repeated spaces collapsed on both sides, so a
  // doubled space (typed or stored) doesn't block a correct name.
  const squash = (s: string) => s.trim().replace(/\s+/g, " ");
  const matches = squash(typed) === squash(client.name);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    const result = await deleteClient(authorizedFetch, client.id);
    if (result.ok) {
      router.replace("/dashboard/patients");
      return;
    }
    setBusy(false);
    setError(t("failed"));
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setTyped("");
          setError(null);
          setOpen(true);
        }}
        className="inline-flex h-11 items-center gap-2 rounded-field border border-status-late/30 bg-card px-5 text-sm font-semibold text-status-late transition-colors hover:bg-status-late-bg"
      >
        <Trash2 size={17} strokeWidth={1.9} />
        {t("button")}
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} title={t("title")} busy={busy}>
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-ink-muted">{t("body", { name: client.name })}</p>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-ink">{t("confirmLabel")}</span>
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={client.name}
              className="h-12 w-full rounded-field border border-border bg-canvas/60 px-3.5 text-sm text-ink outline-none transition-all focus:border-status-late focus:bg-card focus:ring-4 focus:ring-status-late/10"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>
              {t("cancel")}
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!matches || busy}
              className="inline-flex h-11 items-center gap-2 rounded-field bg-status-late px-5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={16} />
              {t("confirm")}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}

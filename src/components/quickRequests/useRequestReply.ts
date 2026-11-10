"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { closeQuickRequest, respondToQuickRequest, type QuickRequest } from "@/lib/quickRequests/api";

/**
 * The reply box's state and its two calls (send the reply, close without
 * one), shared by the patient page's QuickRequestCard and the requests
 * inbox so both report errors the same way. `onChanged` gets the request as
 * the server now has it.
 */
export function useRequestReply(request: QuickRequest, onChanged: (next: QuickRequest) => void) {
  const t = useTranslations("quickRequests");
  const { authorizedFetch } = useAuth();

  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<"send" | "close" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(kind: "send" | "close", action: () => ReturnType<typeof respondToQuickRequest>) {
    setBusy(kind);
    setError(null);
    const r = await action();
    setBusy(null);

    if (!r.ok) {
      setError(r.error.errors?.response?.[0] ?? r.error.message ?? t("failed"));
      return;
    }

    onChanged({ ...request, ...r.data });
  }

  return {
    reply,
    setReply,
    busy,
    error,
    canSend: reply.trim() !== "",
    send: () => run("send", () => respondToQuickRequest(authorizedFetch, request.id, reply.trim())),
    close: () => run("close", () => closeQuickRequest(authorizedFetch, request.id)),
  };
}

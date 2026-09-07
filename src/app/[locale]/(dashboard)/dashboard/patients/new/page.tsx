"use client";

import { useTranslations } from "next-intl";
import { AddClientForm } from "@/components/clients/AddClientForm";

export default function AddClientPage() {
  const t = useTranslations("clients.add");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="rounded-card border border-border bg-card p-6">
        <AddClientForm />
      </div>
    </div>
  );
}

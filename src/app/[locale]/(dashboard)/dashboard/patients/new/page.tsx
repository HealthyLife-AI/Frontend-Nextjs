"use client";

import { useTranslations } from "next-intl";
import { AddClientForm } from "@/components/clients/AddClientForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AddClientPage() {
  const t = useTranslations("clients.add");

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="rounded-panel border border-border/70 bg-card p-6 shadow-panel">
        <AddClientForm />
      </div>
    </div>
  );
}

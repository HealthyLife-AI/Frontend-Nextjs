"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostEditor } from "@/components/posts/PostEditor";

/** Phase 3, A6: a blank post. Saving it moves to its own page. */
export default function NewPostPage() {
  const t = useTranslations("posts");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader title={t("newTitle")} subtitle={t("editorSubtitle")} />
      <PostEditor />
    </div>
  );
}

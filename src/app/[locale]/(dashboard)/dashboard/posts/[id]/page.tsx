"use client";

import { use, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/components/auth/AuthProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { PostEditor } from "@/components/posts/PostEditor";
import { getPost, type Post } from "@/lib/posts/api";

/** Phase 3, A6: edit one post (a draft, or a published one: changes show at once, nobody is pushed again). */
export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("posts");
  const { authorizedFetch } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getPost(authorizedFetch, id).then((r) => {
      if (cancelled) return;
      if (r.ok) setPost(r.data);
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, id]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <PageHeader title={t("editTitle")} subtitle={t("editorSubtitle")} />

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {!post && !failed && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {/* Keyed on the id so moving from "new" to a saved post remounts with the saved values. */}
      {post && <PostEditor key={post.id} post={post} />}
    </div>
  );
}

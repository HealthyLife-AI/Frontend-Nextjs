"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Lightbulb, Pin, Plus, Sparkles } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatLongDate } from "@/lib/format/date";
import { createPost, getPostTemplates, listPosts, type Post, type PostPage, type PostTemplate } from "@/lib/posts/api";

/**
 * Phase 3, A6: «النصائح»: the education posts this nutritionist wrote, with
 * status, audience and how many readers each has. A new one starts blank or
 * from one of the ready-made tip lines («من النصائح الجاهزة»), which becomes a
 * draft to edit before anyone sees it.
 */
export default function PostsPage() {
  const t = useTranslations("posts");
  const tCond = useTranslations("posts.condition");
  const locale = useLocale();
  const router = useRouter();
  const { authorizedFetch } = useAuth();

  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostPage | null>(null);
  const [failed, setFailed] = useState(false);

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<PostTemplate[] | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await listPosts(authorizedFetch, page);
    if (r.ok) setPosts(r.data);
    else setFailed(true);
  }, [authorizedFetch, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function openTemplates() {
    setTemplatesOpen(true);
    if (templates !== null) return;

    const r = await getPostTemplates(authorizedFetch);
    setTemplates(r.ok ? r.data : []);
  }

  async function startFromTemplate(template: PostTemplate) {
    setCreating(true);
    setError(null);

    const r = await createPost(authorizedFetch, {
      title: t("templateTitle"),
      body: template.text,
      audience: template.condition_codes.length > 0 ? "conditions" : "all",
      ...(template.condition_codes.length > 0 ? { condition_codes: template.condition_codes } : {}),
    });
    setCreating(false);

    if (!r.ok) return setError(t("saveFailed"));
    router.push(`/dashboard/posts/${r.data.id}`);
  }

  const audienceLabel = (post: Post) => {
    if (post.audience === "conditions") return `${t("audience.conditions")}: ${(post.condition_codes ?? []).map((c) => tCond(c)).join("، ")}`;
    if (post.audience === "patients") return t("audienceCount", { count: post.patient_ids?.length ?? 0 });
    return t("audience.all");
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={openTemplates}>
              <Sparkles size={16} aria-hidden="true" />
              {t("fromTemplates")}
            </Button>
            <Link href="/dashboard/posts/new" className="inline-flex">
              <Button type="button">
                <Plus size={16} aria-hidden="true" />
                {t("new")}
              </Button>
            </Link>
          </div>
        }
      />

      {failed && (
        <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
          {t("loadFailed")}
        </p>
      )}

      {posts === null && !failed && <div className="py-10 text-center text-sm text-ink-muted">…</div>}

      {posts?.data.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-panel border border-border/70 bg-card py-16 text-center shadow-panel">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb size={22} strokeWidth={1.75} />
          </div>
          <p className="max-w-xs text-sm text-ink-muted">{t("empty")}</p>
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {posts?.data.map((post) => (
          <li key={post.id}>
            <Link
              href={`/dashboard/posts/${post.id}`}
              className="flex flex-col gap-2 rounded-panel border border-border/70 bg-card p-4 shadow-panel transition-colors hover:border-primary/40"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="min-w-0 flex-1 break-words text-base font-bold text-ink">{post.title}</h2>
                {post.pinned && <Pin size={14} className="text-primary" aria-label={t("pinned")} />}
                <Badge tone={post.status === "published" ? "success" : "neutral"}>{t(`status.${post.status}`)}</Badge>
              </div>
              <p className="line-clamp-2 whitespace-pre-wrap break-words text-sm text-ink-muted">{post.body}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
                <span>{audienceLabel(post)}</span>
                {post.status === "published" && <span>{t("readCount", { count: post.read_count ?? 0 })}</span>}
                {post.published_at && <span>{formatLongDate(post.published_at.slice(0, 10), locale)}</span>}
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {posts && posts.meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button type="button" variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("previous")}
          </Button>
          <span className="text-sm tabular-nums text-ink-muted">
            {posts.meta.current_page}/{posts.meta.last_page}
          </span>
          <Button type="button" variant="ghost" disabled={page >= posts.meta.last_page} onClick={() => setPage((p) => p + 1)}>
            {t("next")}
          </Button>
        </div>
      )}

      <Dialog open={templatesOpen} onClose={() => setTemplatesOpen(false)} title={t("templatesTitle")} busy={creating} size="lg">
        <p className="mb-4 text-sm text-ink-muted">{t("templatesHint")}</p>

        {error && (
          <p role="alert" className="mb-3 rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {error}
          </p>
        )}

        {templates === null && <p className="text-sm text-ink-muted">…</p>}
        {templates?.length === 0 && <p className="text-sm text-ink-muted">{t("noTemplates")}</p>}

        <ul className="flex flex-col gap-2">
          {templates?.map((template) => (
            <li key={template.text}>
              <button
                type="button"
                disabled={creating}
                onClick={() => startFromTemplate(template)}
                className="flex w-full flex-col gap-1.5 rounded-field border border-border/70 p-3 text-start transition-colors hover:border-primary/50 hover:bg-mkt-mint-bg disabled:opacity-60"
              >
                <span className="whitespace-pre-wrap break-words text-sm text-ink">{template.text}</span>
                {template.condition_codes.length > 0 && (
                  <span className="text-xs text-ink-muted">{template.condition_codes.map((c) => tCond(c)).join("، ")}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </Dialog>
    </div>
  );
}

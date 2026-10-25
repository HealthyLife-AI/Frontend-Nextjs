"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/TextField";
import { PostPhonePreview } from "./PostPhonePreview";
import { getClient, listClients } from "@/lib/clients/api";
import type { Client } from "@/lib/clients/types";
import {
  BODY_MAX,
  TITLE_MAX,
  createPost,
  deletePost,
  getPostStats,
  publishPost,
  unpublishPost,
  updatePost,
  type Post,
  type PostAudience,
  type PostInput,
} from "@/lib/posts/api";

/** The codes a post can be aimed at ("other" is free text per patient, so it is not one). */
const CONDITION_CODES = [
  "diabetes_type1",
  "diabetes_type2",
  "gestational_diabetes",
  "insulin_resistance",
  "prediabetes",
  "hypertension",
  "kidney_disease",
  "liver_disease",
  "cancer",
  "celiac",
  "fluid_retention",
] as const;

const AUDIENCES: PostAudience[] = ["all", "conditions", "patients"];

/**
 * Phase 3, A6: write, aim, preview and publish one education post.
 *
 * Plain text only: the counter is the server's limit (title 120, body 2000),
 * and the preview shows it the way the app will. «نشر» saves first, so the
 * patients never get an older version. The push goes out on the first publish
 * only (the server decides); editing a published post or publishing it again
 * sends nothing.
 */
export function PostEditor({ post, initial }: { post?: Post; initial?: Partial<PostInput> }) {
  const t = useTranslations("posts");
  const tCond = useTranslations("posts.condition");
  const router = useRouter();
  const { authorizedFetch } = useAuth();

  const [saved, setSaved] = useState<Post | undefined>(post);
  const [title, setTitle] = useState(post?.title ?? initial?.title ?? "");
  const [body, setBody] = useState(post?.body ?? initial?.body ?? "");
  const [audience, setAudience] = useState<PostAudience>(post?.audience ?? initial?.audience ?? "all");
  const [codes, setCodes] = useState<string[]>(post?.condition_codes ?? initial?.condition_codes ?? []);
  const [patients, setPatients] = useState<{ id: number; name: string }[]>([]);
  const [pinned, setPinned] = useState(post?.pinned ?? false);

  const [busy, setBusy] = useState<null | "save" | "publish" | "unpublish" | "delete">(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<{ audience_count: number; read_count: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Names for the patients a saved post is aimed at (the post only holds their ids).
  useEffect(() => {
    const ids = post?.patient_ids ?? [];
    if (ids.length === 0) return;

    let cancelled = false;
    Promise.all(ids.map((id) => getClient(authorizedFetch, id))).then((results) => {
      if (cancelled) return;
      setPatients(results.flatMap((r) => (r.ok ? [{ id: Number(r.data.id), name: r.data.name }] : [])));
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, post?.patient_ids]);

  useEffect(() => {
    if (!saved?.id || saved.status !== "published") return;

    let cancelled = false;
    getPostStats(authorizedFetch, saved.id).then((r) => {
      if (!cancelled && r.ok) setStats(r.data);
    });
    return () => {
      cancelled = true;
    };
  }, [authorizedFetch, saved?.id, saved?.status]);

  const published = saved?.status === "published";
  const input = (): PostInput => ({
    title: title.trim(),
    body: body.trim(),
    audience,
    pinned,
    ...(audience === "conditions" ? { condition_codes: codes } : {}),
    ...(audience === "patients" ? { patient_ids: patients.map((p) => p.id) } : {}),
  });

  /** Saves the form; returns the saved post, or null with the errors shown. */
  async function save(): Promise<Post | null> {
    setError(null);
    setFieldErrors({});
    setMessage(null);

    const r = saved ? await updatePost(authorizedFetch, saved.id, input()) : await createPost(authorizedFetch, input());

    if (!r.ok) {
      setFieldErrors(r.error.errors ?? {});
      setError(r.error.errors ? t("fixErrors") : t("saveFailed"));
      return null;
    }

    setSaved(r.data);
    return r.data;
  }

  async function onSave() {
    setBusy("save");
    const result = await save();
    setBusy(null);

    if (!result) return;
    if (!saved) return router.replace(`/dashboard/posts/${result.id}`);
    setMessage(t("saved"));
  }

  async function onPublish() {
    setBusy("publish");
    const result = await save();
    if (!result) return setBusy(null);

    const r = await publishPost(authorizedFetch, result.id);
    setBusy(null);

    if (!r.ok) return setError(t("saveFailed"));
    setSaved(r.data);
    setMessage(t("published"));
    if (!post) router.replace(`/dashboard/posts/${result.id}`);
  }

  async function onUnpublish() {
    if (!saved) return;
    setBusy("unpublish");
    const r = await unpublishPost(authorizedFetch, saved.id);
    setBusy(null);

    if (!r.ok) return setError(t("saveFailed"));
    setSaved(r.data);
    setStats(null);
    setMessage(t("unpublished"));
  }

  async function onDelete() {
    if (!saved) return;
    setBusy("delete");
    const ok = await deletePost(authorizedFetch, saved.id);
    setBusy(null);

    if (!ok) return setError(t("saveFailed"));
    router.replace("/dashboard/posts");
  }

  const toggleCode = (code: string) => setCodes((list) => (list.includes(code) ? list.filter((c) => c !== code) : [...list, code]));

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex flex-col gap-5 rounded-panel border border-border/70 bg-card p-5 shadow-panel">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={published ? "success" : "neutral"}>{t(published ? "status.published" : "status.draft")}</Badge>
          {published && stats && <span className="text-sm text-ink-muted">{t("readStats", { read: stats.read_count, total: stats.audience_count })}</span>}
        </div>

        {error && (
          <p role="alert" className="rounded-field bg-status-late-bg px-3.5 py-2.5 text-sm text-status-late">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="rounded-field bg-status-on-track-bg px-3.5 py-2.5 text-sm text-status-on-track">
            {message}
          </p>
        )}

        <div className="flex flex-col gap-1">
          <TextField label={t("titleLabel")} value={title} maxLength={TITLE_MAX} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title?.[0]} />
          <span className="text-xs tabular-nums text-ink-muted">
            {title.length}/{TITLE_MAX}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="post-body" className="text-sm font-semibold text-ink">
            {t("bodyLabel")}
          </label>
          <textarea
            id="post-body"
            value={body}
            maxLength={BODY_MAX}
            rows={8}
            onChange={(e) => setBody(e.target.value)}
            aria-invalid={Boolean(fieldErrors.body)}
            className="w-full resize-y rounded-field border border-border bg-canvas/60 px-3.5 py-3 text-sm leading-relaxed text-ink outline-none transition-all hover:border-primary/30 focus:border-primary focus:bg-card focus:ring-4 focus:ring-primary/10"
          />
          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{fieldErrors.body?.[0] ?? t("plainTextHint")}</span>
            <span className={`tabular-nums ${body.length >= BODY_MAX ? "font-bold text-status-late" : ""}`}>
              {body.length}/{BODY_MAX}
            </span>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-semibold text-ink">{t("audienceLabel")}</legend>
          <div className="flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <label
                key={a}
                className={`flex cursor-pointer items-center gap-2 rounded-field border px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  audience === a ? "border-primary bg-primary/[0.06] text-primary" : "border-border/70 text-ink-muted hover:border-primary/40"
                }`}
              >
                <input type="radio" name="audience" value={a} checked={audience === a} onChange={() => setAudience(a)} className="accent-[var(--color-primary)]" />
                {t(`audience.${a}`)}
              </label>
            ))}
          </div>

          {audience === "conditions" && (
            <div className="flex flex-col gap-2 rounded-field bg-canvas/60 p-3">
              <p className="text-xs text-ink-muted">{t("conditionsHint")}</p>
              <div className="flex flex-wrap gap-2">
                {CONDITION_CODES.map((code) => (
                  <label
                    key={code}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                      codes.includes(code) ? "border-primary bg-primary/10 text-primary" : "border-border/70 bg-card text-ink-muted"
                    }`}
                  >
                    <input type="checkbox" checked={codes.includes(code)} onChange={() => toggleCode(code)} className="sr-only" />
                    {tCond(code)}
                  </label>
                ))}
              </div>
              {fieldErrors.condition_codes && <p className="text-xs text-status-late">{fieldErrors.condition_codes[0]}</p>}
            </div>
          )}

          {audience === "patients" && (
            <PatientPicker selected={patients} onChange={setPatients} error={fieldErrors.patient_ids?.[0] ?? fieldErrors["patient_ids.0"]?.[0]} />
          )}
        </fieldset>

        <label className="flex items-center gap-2 text-sm font-semibold text-ink">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="h-4 w-4 accent-[var(--color-primary)]" />
          {t("pin")}
        </label>

        <div className="flex flex-wrap items-center gap-2.5 border-t border-divider pt-4">
          <Button type="button" variant="secondary" isLoading={busy === "save"} disabled={busy !== null} onClick={onSave}>
            {t("save")}
          </Button>
          {!published && (
            <Button type="button" isLoading={busy === "publish"} disabled={busy !== null} onClick={onPublish}>
              {t("publish")}
            </Button>
          )}
          {published && (
            <Button type="button" variant="ghost" isLoading={busy === "unpublish"} disabled={busy !== null} onClick={onUnpublish}>
              {t("unpublish")}
            </Button>
          )}
          {saved && (
            <Button type="button" variant="ghost" className="ms-auto text-status-late" disabled={busy !== null} onClick={() => setConfirmDelete(true)}>
              {t("delete")}
            </Button>
          )}
        </div>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <PostPhonePreview title={title} body={body} pinned={pinned} />
      </div>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} title={t("deleteTitle")} busy={busy === "delete"}>
        <p className="mb-5 text-sm text-ink-muted">{t("deleteBody")}</p>
        <div className="flex justify-end gap-2.5">
          <Button type="button" variant="ghost" onClick={() => setConfirmDelete(false)} disabled={busy === "delete"}>
            {t("cancel")}
          </Button>
          <Button type="button" isLoading={busy === "delete"} onClick={onDelete}>
            {t("delete")}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

const MIN_QUERY = 2;

/** Search the nutritionist's own patients by name and pick several. */
function PatientPicker({ selected, onChange, error }: { selected: { id: number; name: string }[]; onChange: (next: { id: number; name: string }[]) => void; error?: string }) {
  const t = useTranslations("posts");
  const { authorizedFetch } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const request = useRef(0);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY) return;

    const mine = ++request.current;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearching(true);

    const timer = setTimeout(async () => {
      const r = await listClients(authorizedFetch, { search: query.trim() });
      if (mine !== request.current) return;
      setSearching(false);
      setResults(r.ok ? r.data.data : []);
    }, 300);

    return () => clearTimeout(timer);
  }, [authorizedFetch, query]);

  const shown = query.trim().length >= MIN_QUERY ? results.filter((c) => !selected.some((s) => s.id === Number(c.id))) : [];

  return (
    <div className="flex flex-col gap-2 rounded-field bg-canvas/60 p-3">
      <div className="flex flex-wrap gap-1.5">
        {selected.length === 0 && <span className="text-xs text-ink-muted">{t("noPatients")}</span>}
        {selected.map((p) => (
          <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-primary/10 py-1 ps-3 pe-1.5 text-xs font-semibold text-primary">
            {p.name}
            <button type="button" onClick={() => onChange(selected.filter((s) => s.id !== p.id))} aria-label={t("removePatient", { name: p.name })} className="rounded-full p-0.5 hover:bg-primary/15">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("patientSearch")}
          className="h-10 w-full rounded-field border border-border bg-card ps-9 pe-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      {searching && <p className="text-xs text-ink-muted">{t("searching")}</p>}
      {shown.length > 0 && (
        <ul className="flex max-h-48 flex-col overflow-y-auto rounded-field border border-border/70 bg-card">
          {shown.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => {
                  onChange([...selected, { id: Number(c.id), name: c.name }]);
                  setQuery("");
                  setResults([]);
                }}
                className="w-full px-3 py-2 text-start text-sm text-ink hover:bg-mkt-mint-bg"
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-status-late">{error}</p>}
    </div>
  );
}

import { type Fetcher, parseJson } from "@/lib/api";

/** Phase 3, A: education posts ("نصائح أخصائيتك"). Plain text only. */
export type PostAudience = "all" | "conditions" | "patients";
export type PostStatus = "draft" | "published";

export type Post = {
  id: number;
  title: string;
  body: string;
  audience: PostAudience;
  condition_codes: string[] | null;
  patient_ids: number[] | null;
  status: PostStatus;
  pinned: boolean;
  /** The FIRST publish; kept when the post is unpublished and published again. */
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  read_count?: number;
};

export type PostPage = {
  data: Post[];
  meta: { current_page: number; last_page: number; total: number; per_page: number };
};

export type PostInput = {
  title: string;
  body: string;
  audience: PostAudience;
  condition_codes?: string[];
  patient_ids?: number[];
  pinned?: boolean;
};

export type PostTemplate = { text: string; condition_codes: string[] };

export const TITLE_MAX = 120;
export const BODY_MAX = 2000;

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: body === undefined ? undefined : JSON.stringify(body),
});

export const listPosts = (f: Fetcher, page = 1) => f(`/posts${page > 1 ? `?page=${page}` : ""}`).then((r) => parseJson<PostPage>(r));

export const getPost = (f: Fetcher, id: number | string) => f(`/posts/${id}`).then((r) => parseJson<Post>(r));

export const createPost = (f: Fetcher, input: PostInput) => f("/posts", json("POST", input)).then((r) => parseJson<Post>(r));

export const updatePost = (f: Fetcher, id: number | string, input: Partial<PostInput>) =>
  f(`/posts/${id}`, json("PUT", input)).then((r) => parseJson<Post>(r));

export const deletePost = async (f: Fetcher, id: number | string) => (await f(`/posts/${id}`, { method: "DELETE" })).ok;

export const publishPost = (f: Fetcher, id: number | string) => f(`/posts/${id}/publish`, json("POST")).then((r) => parseJson<Post>(r));

export const unpublishPost = (f: Fetcher, id: number | string) => f(`/posts/${id}/unpublish`, json("POST")).then((r) => parseJson<Post>(r));

export const getPostStats = (f: Fetcher, id: number | string) =>
  f(`/posts/${id}/stats`).then((r) => parseJson<{ audience_count: number; read_count: number }>(r));

export const getPostTemplates = (f: Fetcher) => f("/posts/templates").then((r) => parseJson<PostTemplate[]>(r));

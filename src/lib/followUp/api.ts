import { type Fetcher, parseJson } from "@/lib/api";
import type { Food } from "@/lib/clients/types";
import type { Macros, MealName } from "@/lib/mealPlans/types";

/** Mirrors API_CONTRACT.md "Follow-up between sessions & notifications (Phase 2)". */

/** What a log was when the patient made it; never re-derived after a plan edit. */
export type LogKind = "planned" | "alternative" | "off_plan";

export type DailyLog = {
  id: number;
  food: Food;
  quantity_grams: number;
  macros: Macros;
  meal_type: MealName | null;
  log_kind: LogKind;
  is_on_plan: boolean;
  logged_at: string;
  is_late: boolean;
  edited_at: string | null;
};

export type LogDay = {
  date: string;
  planned_calories: number | null;
  logged_calories: number;
  logs: DailyLog[];
};

export type DailyMealLogs = { from: string; to: string; days: LogDay[] };

export function getDailyMealLogs(fetcher: Fetcher, subscriberId: number | string, from: string, to: string) {
  return fetcher(`/clients/${subscriberId}/meal-logs/daily?from=${from}&to=${to}`).then((res) => parseJson<DailyMealLogs>(res));
}

/** Three states, never a number (Phase 2 decision). */
export type ReviewRating = "on_track" | "small_adjustment" | "review_together";

export const REVIEW_RATINGS: ReviewRating[] = ["on_track", "small_adjustment", "review_together"];

export const MAX_NOTE_LENGTH = 2000;

export type ReviewTask = { id: number; title: string; done_at: string | null };

export type Review = {
  id: number;
  rating: ReviewRating | null;
  note: string | null;
  key_points: string[];
  tasks: ReviewTask[];
  acknowledged_at: string | null;
  edited_at: string | null;
  created_at: string;
};

export type ReviewInput = {
  rating: ReviewRating | null;
  note: string | null;
  key_points: string[];
  /** `id` keeps an existing task (and its done state); without it the task is new. */
  tasks: { id?: number; title: string }[];
};

export function listReviews(fetcher: Fetcher, subscriberId: number | string) {
  return fetcher(`/clients/${subscriberId}/reviews`).then((res) => parseJson<Review[]>(res));
}

export function createReview(fetcher: Fetcher, subscriberId: number | string, input: ReviewInput) {
  return fetcher(`/clients/${subscriberId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }).then((res) => parseJson<Review>(res));
}

export function updateReview(fetcher: Fetcher, subscriberId: number | string, reviewId: number, input: ReviewInput) {
  return fetcher(`/clients/${subscriberId}/reviews/${reviewId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }).then((res) => parseJson<Review>(res));
}

export async function deleteReview(fetcher: Fetcher, subscriberId: number | string, reviewId: number): Promise<boolean> {
  const res = await fetcher(`/clients/${subscriberId}/reviews/${reviewId}`, { method: "DELETE" });

  return res.ok;
}
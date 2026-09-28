import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";

/** Passthrough to Laravel's forgot-password (always 200 there; see API_CONTRACT). */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { status, data } = await laravelFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(data, { status });
}

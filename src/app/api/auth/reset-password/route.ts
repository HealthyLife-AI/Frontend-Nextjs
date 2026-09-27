import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";

/** Passthrough to Laravel's reset-password. */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { status, data } = await laravelFetch("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(data, { status });
}

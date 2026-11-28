import { NextRequest, NextResponse } from "next/server";
import { laravelFetch } from "@/lib/auth/api";

/** Passthrough to Laravel's email/verify (BE-17). The link's own token is the credential. */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { status, data } = await laravelFetch("/auth/email/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return NextResponse.json(data, { status });
}

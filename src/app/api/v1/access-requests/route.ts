import { NextResponse } from "next/server";

import { serverApiPost, ServerApiError } from "@/lib/api/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await serverApiPost<{ received: true }>("/api/v1/access-requests", body);
    return NextResponse.json(result, { status: 202 });
  } catch (cause) {
    if (cause instanceof ServerApiError) {
      return NextResponse.json({ error: cause.message }, { status: cause.status || 500 });
    }
    return NextResponse.json(
      { error: "Could not submit access request. Please try again." },
      { status: 500 },
    );
  }
}

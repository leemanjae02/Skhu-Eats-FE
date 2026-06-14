import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetchRaw } from "@/lib/fetch";

// /api/notifications/* → backend /notifications/*
async function proxyNotifications(req: NextRequest): Promise<NextResponse> {
  const backendPath =
    req.nextUrl.pathname.replace(/^\/api/, "") + req.nextUrl.search;

  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  let body: string | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      body = await req.text();
    } catch {
      // ignore
    }
  }

  try {
    const fetchOptions: RequestInit = { method: req.method };
    if (body !== undefined) fetchOptions.body = body;

    const { status, data } = await serverFetchRaw(
      backendPath,
      token,
      fetchOptions,
    );
    if (status === 204 || status === 304) {
      return new NextResponse(null, { status });
    }
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("[Proxy /api/notifications] Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export const GET = proxyNotifications;
export const PATCH = proxyNotifications;

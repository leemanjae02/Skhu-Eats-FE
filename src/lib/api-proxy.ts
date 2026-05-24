import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverFetchRaw } from "./fetch";

export async function proxyRequest(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  let body: string | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      body = await req.text();
    } catch (e) {
      console.error("[Proxy] Error reading request body:", e);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(`[Proxy] ${req.method} ${url}`);
  }

  try {
    const fetchOptions: RequestInit = { method: req.method };
    if (body !== undefined) fetchOptions.body = body;

    const { status, data } = await serverFetchRaw(url, token, fetchOptions);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { serverFetchRaw } from "./fetch";

export async function proxyRequest(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/, "") ?? undefined;
  
  let body: string | undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      body = await req.text();
    } catch (e) {
      console.error("[Proxy] Error reading request body:", e);
    }
  }

  console.log(`[Proxy] ${req.method} ${url} -> Proxying to API`);

  try {
    const fetchOptions: RequestInit = {
      method: req.method,
    };

    if (body !== undefined) {
      fetchOptions.body = body;
    }

    const { status, data } = await serverFetchRaw(url, token, fetchOptions);
    console.log(`[Proxy] API responded with status ${status}`);
    return NextResponse.json(data, { status });
  } catch (error) {
    console.error("[Proxy] Critical Error:", error);
    return NextResponse.json(
      { message: "Internal Proxy Error", error: String(error) }, 
      { status: 500 }
    );
  }
}

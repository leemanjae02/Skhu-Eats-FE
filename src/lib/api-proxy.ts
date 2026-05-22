import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { serverFetchRaw } from "./fetch";

export async function proxyRequest(req: NextRequest): Promise<NextResponse> {
  const url = req.nextUrl.pathname + req.nextUrl.search;
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/, "") ?? undefined;
  const body = !["GET", "HEAD"].includes(req.method) ? await req.text() : undefined;

  try {
    const { status, data } = await serverFetchRaw(url, token, {
      method: req.method,
      body,
    });
    return NextResponse.json(data, { status });
  } catch {
    return NextResponse.json({ message: "Upstream error" }, { status: 502 });
  }
}

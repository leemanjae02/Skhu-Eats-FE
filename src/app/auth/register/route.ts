import { NextRequest, NextResponse } from "next/server";
import { serverFetchRaw } from "@/lib/fetch";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const { status, data } = await serverFetchRaw("/auth/register", undefined, {
    method: "POST",
    body,
  });

  const d = data as Record<string, unknown>;
  if (status < 200 || status >= 300 || !d.access_token) {
    return NextResponse.json(data, { status });
  }

  const { access_token, ...rest } = d;
  const res = NextResponse.json(rest, { status });

  res.cookies.set("auth-token", access_token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

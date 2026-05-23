import { NextRequest, NextResponse } from "next/server";
import { serverFetchRaw } from "@/lib/fetch";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const { status, data } = await serverFetchRaw("/auth/login", undefined, {
    method: "POST",
    body,
  });

  const d = data as Record<string, unknown>;
  if (status !== 200 || !d.token) {
    return NextResponse.json(data, { status });
  }

  const { token, ...rest } = d;
  const res = NextResponse.json(rest, { status });

  res.cookies.set("auth-token", token as string, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}

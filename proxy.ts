import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/", "/friends", "/create", "/chat", "/profile"];
const PUBLIC_ONLY = ["/login", "/register"];

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get("auth-token")?.value;

  const isProtected = PROTECTED.some(
    (r) => path === r || (r !== "/" && path.startsWith(r + "/"))
  );
  const isPublicOnly = PUBLIC_ONLY.some((r) => path.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isPublicOnly && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

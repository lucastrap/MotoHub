import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/garage",
  "/maintenance",
  "/news",
  "/pieces",
  "/weather",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const verifiedToken =
    token &&
    (await verifyAuth(token).catch((err) => {
      console.error("[middleware] token verification failed:", err);
    }));

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (verifiedToken) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    if (!verifiedToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/garage/:path*",
    "/maintenance/:path*",
    "/news/:path*",
    "/pieces/:path*",
    "/weather/:path*",
    "/login",
    "/register",
  ],
};

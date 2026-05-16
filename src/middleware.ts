import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  
  const verifiedToken = token &&
    (await verifyAuth(token).catch((err) => {
      console.error("[middleware] token verification failed:", err);
    }));

  if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")) {
    if (verifiedToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (
    req.nextUrl.pathname.includes("/dashboard") ||
    req.nextUrl.pathname.includes("/garage") ||
    req.nextUrl.pathname.includes("/maintenance")
  ) {
    if (!verifiedToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/garage/:path*", "/maintenance/:path*", "/login", "/register"],
};

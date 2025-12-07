import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("better-auth.session_token") || request.cookies.get("better-auth.session_token.sig"); // Check for session cookie

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/invoices", "/quotations", "/clients", "/items", "/reports", "/settings"],
};
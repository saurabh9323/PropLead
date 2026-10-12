import { NextResponse } from "next/server";

export function proxy(request) {
  const token = request.cookies.get("proplead_token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/leads/:path*", "/users/:path*", "/login"],
};

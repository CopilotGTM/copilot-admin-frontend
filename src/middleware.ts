import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Publicly accessible routes (no auth required)
  const publicRoutes = new Set(["/signin", "/forgot-password", "/reset-password"]);
  const isPublicRoute = publicRoutes.has(pathname);

  // Read persisted auth cookie set by Zustand persist
  const authCookie = request.cookies.get("cg_auth")?.value;
  const hasAuthCookie = Boolean(authCookie);

  // If it's a public route, always allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For all other routes, require auth cookie
  if (!hasAuthCookie) {
    const url = new URL("/signin", request.url);
    // Preserve the path to return after login
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Exclude: API, Next internals, favicon, and any path containing a dot (files like .png, .svg, .css, etc.)
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

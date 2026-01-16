import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { logger } from "@/lib/logger";

// Force Node.js runtime for middleware (required for Prisma)
export const runtime = "nodejs";

// Define public routes that don't require authentication
const publicRoutes = ["/login", "/register", "/api/auth"];

// Define protected routes that require authentication
const protectedRoutes = ["/projects", "/clients", "/team", "/meetings", "/settings", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // Get session with error handling
  let session = null;
  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    // Log the error but don't block the request
    logger.error("Middleware failed to get session", error, { action: "middleware_auth" });

    // If it's a public route, allow access even if database is down
    if (isPublicRoute || pathname === "/" || pathname === "/login" || pathname === "/register") {
      return NextResponse.next();
    }

    // For protected routes, redirect to login with an error message
    if (isProtectedRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "service_unavailable");
      return NextResponse.redirect(loginUrl);
    }
  }

  // If accessing a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages with an active session, redirect to home
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If accessing root without a session, redirect to login
  if (pathname === "/" && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

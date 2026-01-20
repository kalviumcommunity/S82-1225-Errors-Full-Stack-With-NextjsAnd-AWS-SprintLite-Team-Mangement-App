/**
 * Next.js Middleware - Route Protection
 * Handles authentication for protected routes
 *
 * Protected Routes:
 * - /dashboard
 * - /users
 * - /tasks-overview
 *
 * Public Routes:
 * - /
 * - /login
 * - /about
 * - /api/* (API routes handled separately)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-key-change-in-production-minimum-32-characters"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname === "/about" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // Protect private routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/tasks-overview")
  ) {
    const token = req.cookies.get("token")?.value;

    console.log("Middleware checking protected route:", pathname);
    console.log("Token found:", token ? "YES (" + token.substring(0, 20) + "...)" : "NO");
    console.log("All cookies:", req.cookies.getAll());

    if (!token) {
      console.log("No token - redirecting to login");
      // Redirect to login with return URL
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify JWT token using jose (Edge Runtime compatible)
      await jwtVerify(token, JWT_SECRET);
      console.log("Token verified - allowing access");
      return NextResponse.next();
    } catch (error) {
      console.log("Token invalid:", error.message);
      // Invalid token - redirect to login
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);

      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};

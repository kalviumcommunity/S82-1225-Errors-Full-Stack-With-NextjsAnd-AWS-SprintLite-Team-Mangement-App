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

/**
 * Security Headers Configuration
 * Implements OWASP security best practices
 */
function getSecurityHeaders() {
  const headers = new Headers();

  // HSTS - Force HTTPS for 2 years, including subdomains
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");

  // CSP - Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js requires unsafe-eval in dev
    "style-src 'self' 'unsafe-inline'", // Tailwind requires unsafe-inline
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];
  headers.set("Content-Security-Policy", cspDirectives.join("; "));

  // X-Frame-Options - Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // X-Content-Type-Options - Prevent MIME sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Referrer-Policy - Control referrer information
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy - Control browser features
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), interest-cohort=()");

  // X-DNS-Prefetch-Control - Control DNS prefetching
  headers.set("X-DNS-Prefetch-Control", "on");

  // X-Download-Options - Prevent file download in IE
  headers.set("X-Download-Options", "noopen");

  // X-Permitted-Cross-Domain-Policies - Adobe products security
  headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return headers;
}

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
    const response = NextResponse.next();
    const securityHeaders = getSecurityHeaders();
    securityHeaders.forEach((value, key) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Protect private routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/tasks-overview")
  ) {
    // Use accessToken cookie (real JWT) instead of token
    const token = req.cookies.get("accessToken")?.value;

    console.log("Middleware checking protected route:", pathname);
    console.log("Token found:", token ? "YES (" + token.substring(0, 20) + "...)" : "NO");
    console.log("All cookies:", req.cookies.getAll());

    if (!token) {
      console.log("No token - redirecting to login");
      // Redirect to login with return URL
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      const securityHeaders = getSecurityHeaders();
      securityHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }

    try {
      // Verify JWT token using jose (Edge Runtime compatible)
      await jwtVerify(token, JWT_SECRET);
      console.log("Token verified - allowing access");
      const response = NextResponse.next();
      const securityHeaders = getSecurityHeaders();
      securityHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    } catch (error) {
      let errorMsg = "Unknown error";
      if (error && typeof error === "object" && "message" in error) {
        errorMsg = error.message as string;
      }
      console.log("Token invalid:", errorMsg);
      // Invalid token - redirect to login
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("returnUrl", pathname);

      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("token");
      const securityHeaders = getSecurityHeaders();
      securityHeaders.forEach((value, key) => {
        response.headers.set(key, value);
      });
      return response;
    }
  }

  const response = NextResponse.next();
  const securityHeaders = getSecurityHeaders();
  securityHeaders.forEach((value, key) => {
    response.headers.set(key, value);
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

import type { NextConfig } from "next";

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "sprintlite-app.com";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker
  output: "standalone",

  // Optimize for production
  compress: true,
  poweredByHeader: false,

  // HTTPS Redirects & Domain Enforcement
  async redirects() {
    return [
      // Redirect HTTP to HTTPS for root domain
      {
        source: "/(.*)",
        has: [
          {
            type: "host",
            value: DOMAIN,
          },
        ],
        destination: `https://${DOMAIN}/:path*`,
        permanent: true, // HTTP 301
      },
      // Redirect www to non-www (professional standard)
      {
        source: "/(.*)",
        has: [
          {
            type: "host",
            value: `www.${DOMAIN}`,
          },
        ],
        destination: `https://${DOMAIN}/:path*`,
        permanent: true,
      },
    ];
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Download-Options",
            value: "noopen",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

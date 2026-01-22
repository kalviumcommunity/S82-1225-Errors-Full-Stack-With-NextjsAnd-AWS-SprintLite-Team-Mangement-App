/**
 * CORS Configuration for API Routes
 * Implements secure Cross-Origin Resource Sharing
 */

/**
 * CORS configuration options
 */
export const corsConfig = {
  // Allowed origins (adjust for production)
  allowedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.FRONTEND_URL,
  ].filter(Boolean),

  // Allowed HTTP methods
  allowedMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // Allowed headers
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],

  // Exposed headers (headers that clients can access)
  exposedHeaders: ["X-Total-Count", "X-Page-Number", "X-Page-Size"],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours
};

/**
 * Apply CORS headers to a Response
 * @param {Response} response - The response object
 * @param {string} origin - The request origin
 * @returns {Response} Response with CORS headers
 */
export function applyCorsHeaders(response, origin) {
  const headers = new Headers(response.headers);

  // Check if origin is allowed
  if (corsConfig.allowedOrigins.includes(origin) || corsConfig.allowedOrigins.includes("*")) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    // Default to first allowed origin or restrict
    headers.set("Access-Control-Allow-Origin", corsConfig.allowedOrigins[0] || "null");
  }

  headers.set("Access-Control-Allow-Methods", corsConfig.allowedMethods.join(", "));
  headers.set("Access-Control-Allow-Headers", corsConfig.allowedHeaders.join(", "));
  headers.set("Access-Control-Expose-Headers", corsConfig.exposedHeaders.join(", "));

  if (corsConfig.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  headers.set("Access-Control-Max-Age", corsConfig.maxAge.toString());

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Handle CORS preflight OPTIONS request
 * @param {Request} request - The request object
 * @returns {Response} Preflight response
 */
export function handleCorsPreflight(request) {
  const origin = request.headers.get("Origin") || "";

  const headers = new Headers();

  // Check if origin is allowed
  if (corsConfig.allowedOrigins.includes(origin) || corsConfig.allowedOrigins.includes("*")) {
    headers.set("Access-Control-Allow-Origin", origin);
  } else {
    headers.set("Access-Control-Allow-Origin", corsConfig.allowedOrigins[0] || "null");
  }

  headers.set("Access-Control-Allow-Methods", corsConfig.allowedMethods.join(", "));
  headers.set("Access-Control-Allow-Headers", corsConfig.allowedHeaders.join(", "));
  headers.set("Access-Control-Max-Age", corsConfig.maxAge.toString());

  if (corsConfig.credentials) {
    headers.set("Access-Control-Allow-Credentials", "true");
  }

  return new Response(null, {
    status: 204,
    headers,
  });
}

/**
 * Middleware function to add CORS headers to API routes
 * Usage in API route:
 *
 * import { withCors } from '@/lib/cors';
 *
 * export async function GET(request) {
 *   return withCors(request, () => {
 *     // Your API logic here
 *     return new Response(JSON.stringify({ data: 'example' }));
 *   });
 * }
 */
export async function withCors(request, handler) {
  const origin = request.headers.get("Origin") || "";

  // Handle preflight request
  if (request.method === "OPTIONS") {
    return handleCorsPreflight(request);
  }

  // Execute the handler
  const response = await handler();

  // Apply CORS headers to the response
  return applyCorsHeaders(response, origin);
}

/**
 * Check if origin is allowed
 * @param {string} origin - The origin to check
 * @returns {boolean} True if origin is allowed
 */
export function isOriginAllowed(origin) {
  return corsConfig.allowedOrigins.includes(origin) || corsConfig.allowedOrigins.includes("*");
}

/**
 * Example usage in API route:
 *
 * // app/api/example/route.js
 * import { withCors, handleCorsPreflight } from '@/lib/cors';
 *
 * export async function OPTIONS(request) {
 *   return handleCorsPreflight(request);
 * }
 *
 * export async function GET(request) {
 *   return withCors(request, async () => {
 *     const data = { message: 'Hello World' };
 *     return new Response(JSON.stringify(data), {
 *       headers: { 'Content-Type': 'application/json' }
 *     });
 *   });
 * }
 */

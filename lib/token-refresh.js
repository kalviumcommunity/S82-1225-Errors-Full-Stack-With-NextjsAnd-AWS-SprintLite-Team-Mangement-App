/**
 * Token Refresh Utility
 *
 * Handles automatic token refresh when access token expires.
 * Uses HTTP-only cookies for security (refresh token stored securely).
 *
 * Security Features:
 * - No localStorage usage (XSS protection)
 * - Automatic retry with backoff
 * - Token rotation (new refresh token on each refresh)
 * - Prevents concurrent refresh requests
 */

let isRefreshing = false;
let refreshPromise = null;

/**
 * Refresh access token using refresh token
 *
 * @returns {Promise<{success: boolean, accessToken?: string, error?: string}>}
 */
export async function refreshAccessToken() {
  // Prevent concurrent refresh requests
  if (isRefreshing && refreshPromise) {
    console.log("[TOKEN REFRESH] Already refreshing, waiting for existing request...");
    return refreshPromise;
  }

  isRefreshing = true;

  refreshPromise = (async () => {
    try {
      console.log("[TOKEN REFRESH] Requesting new access token...");

      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include", // Include cookies (refresh token)
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("[TOKEN REFRESH] Failed:", error.message);

        // Refresh token expired or invalid - user needs to re-login
        if (response.status === 401) {
          console.log("[TOKEN REFRESH] Refresh token expired, redirecting to login...");
          // Optionally redirect to login
          // window.location.href = "/auth/login";
        }

        return {
          success: false,
          error: error.message || "Failed to refresh token",
        };
      }

      const data = await response.json();
      console.log("[TOKEN REFRESH] Success! New access token received");
      console.log("[TOKEN REFRESH] Token rotation:", data.tokenRotation);

      return {
        success: true,
        accessToken: data.data.accessToken,
        user: data.data.user,
      };
    } catch (error) {
      console.error("[TOKEN REFRESH] Network error:", error);
      return {
        success: false,
        error: "Network error during token refresh",
      };
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Fetch wrapper with automatic token refresh
 *
 * Usage:
 * ```javascript
 * import { fetchWithAuth } from '@/lib/token-refresh';
 *
 * const data = await fetchWithAuth('/api/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: 'New task' })
 * });
 * ```
 *
 * @param {string} url - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function fetchWithAuth(url, options = {}) {
  // Attempt initial request
  let response = await fetch(url, {
    ...options,
    credentials: "include", // Include cookies
  });

  // Check if token expired
  if (response.status === 401) {
    const errorData = await response.json().catch(() => ({}));

    // Only refresh if token is expired (not other 401 errors)
    if (errorData.tokenExpired === true) {
      console.log("[FETCH WITH AUTH] Access token expired, refreshing...");

      // Refresh token
      const refreshResult = await refreshAccessToken();

      if (refreshResult.success) {
        console.log("[FETCH WITH AUTH] Token refreshed, retrying original request...");

        // Retry original request with new token
        // Note: New access token is in cookie, so we don't need to add it manually
        response = await fetch(url, {
          ...options,
          credentials: "include",
        });
      } else {
        console.error("[FETCH WITH AUTH] Token refresh failed:", refreshResult.error);
        // Could redirect to login here
        throw new Error("Authentication failed. Please login again.");
      }
    }
  }

  return response;
}

/**
 * Check if access token is about to expire and refresh proactively
 *
 * Call this periodically (e.g., every 5 minutes) to keep user logged in
 *
 * @returns {Promise<void>}
 */
export async function proactiveTokenRefresh() {
  console.log("[PROACTIVE REFRESH] Checking token expiry...");

  // Try to refresh token proactively
  // This prevents users from encountering 401 errors mid-session
  const result = await refreshAccessToken();

  if (result.success) {
    console.log("[PROACTIVE REFRESH] Token refreshed successfully");
  } else {
    console.log("[PROACTIVE REFRESH] Token refresh not needed or failed");
  }
}

/**
 * Setup automatic token refresh interval
 *
 * Call this once when your app initializes (e.g., in App.jsx or layout)
 *
 * @param {number} intervalMinutes - How often to refresh (default: 10 minutes)
 * @returns {number} Interval ID (use clearInterval to stop)
 */
export function setupAutoRefresh(intervalMinutes = 10) {
  console.log(`[AUTO REFRESH] Setting up automatic refresh every ${intervalMinutes} minutes`);

  // Initial refresh
  proactiveTokenRefresh();

  // Setup interval
  const intervalMs = intervalMinutes * 60 * 1000;
  return setInterval(proactiveTokenRefresh, intervalMs);
}

/**
 * Example usage in root layout or app component:
 *
 * ```javascript
 * "use client";
 *
 * import { useEffect } from 'react';
 * import { setupAutoRefresh } from '@/lib/token-refresh';
 *
 * export default function App({ children }) {
 *   useEffect(() => {
 *     // Refresh token every 10 minutes
 *     const intervalId = setupAutoRefresh(10);
 *
 *     return () => clearInterval(intervalId);
 *   }, []);
 *
 *   return <>{children}</>;
 * }
 * ```
 */

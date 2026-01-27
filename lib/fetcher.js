/**
 * Fetcher Function for SWR
 *
 * This is a centralized fetching function used by SWR hooks throughout the app.
 * It handles:
 * - Consistent error handling
 * - Response validation
 * - JSON parsing
 * - Error throwing for SWR's error state
 *
 * Usage:
 * const { data, error } = useSWR("/api/users", fetcher);
 *
 * Benefits:
 * - Single source of truth for fetch logic
 * - Easy to add auth headers, logging, etc.
 * - Consistent error handling across all SWR hooks
 */

export const fetcher = async (url) => {
  console.log(`🔄 Fetching: ${url}`);

  // Always send credentials (cookies) for auth-protected endpoints
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    error.status = res.status;
    error.info = await res.json().catch(() => ({}));
    console.error(`❌ Fetch failed for ${url}:`, error);
    throw error;
  }

  const data = await res.json();
  console.log(`✅ Fetched ${url}:`, data.length || "data", "items");

  return data;
};

/**
 * Fetcher with authentication token
 * Use this for protected API routes
 */
export const fetcherWithAuth = async (url) => {
  console.log(`🔐 Fetching (auth): ${url}`);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    const error = new Error("Failed to fetch data");
    error.status = res.status;
    error.info = await res.json().catch(() => ({}));
    console.error(`❌ Auth fetch failed for ${url}:`, error);
    throw error;
  }

  const data = await res.json();
  console.log(`✅ Fetched (auth) ${url}:`, data.length || "data", "items");

  return data;
};

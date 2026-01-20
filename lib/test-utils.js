/**
 * Test Utilities for Loading and Error States
 *
 * This file provides utilities to simulate delays and errors
 * for testing loading skeletons and error boundaries.
 *
 * Usage:
 * 1. Import simulateDelay or simulateError in your page component
 * 2. Call them before data fetching to test different states
 * 3. Remove calls for production
 */

/**
 * Simulates a network delay
 *
 * @param {number} ms - Milliseconds to delay (default: 2000)
 * @returns {Promise<void>}
 *
 * @example
 * // In your page component
 * await simulateDelay(3000); // 3 second delay
 * const data = await fetchData();
 */
export const simulateDelay = (ms = 2000) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Simulates a random error
 *
 * @param {number} probability - Probability of error (0-1, default: 1)
 * @param {string} message - Custom error message
 * @throws {Error} Always throws an error (unless probability check fails)
 *
 * @example
 * // In your page component
 * simulateError(0.5, "API temporarily unavailable"); // 50% chance of error
 */
export const simulateError = (probability = 1, message = "Simulated error for testing") => {
  if (Math.random() < probability) {
    throw new Error(message);
  }
};

/**
 * Simulates slow network conditions
 *
 * @param {Function} fetchFn - The fetch function to wrap
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Wrapped fetch function with delay
 *
 * @example
 * const slowFetch = withSlowNetwork(fetch, 3000);
 * const response = await slowFetch('/api/tasks');
 */
export const withSlowNetwork = (fetchFn, delay = 2000) => {
  return async (...args) => {
    await simulateDelay(delay);
    return fetchFn(...args);
  };
};

/**
 * Test mode configuration
 * Set via environment variables or URL query params
 */
export const getTestMode = () => {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);

  return {
    delay: params.get("test-delay") ? parseInt(params.get("test-delay")) : null,
    error: params.get("test-error") === "true",
    errorMessage: params.get("test-error-message") || "Simulated error",
  };
};

/**
 * Apply test conditions based on URL params
 *
 * @example
 * // Navigate to: /dashboard?test-delay=3000&test-error=true
 * // In your component:
 * await applyTestConditions();
 */
export const applyTestConditions = async () => {
  const testMode = getTestMode();

  if (testMode.delay) {
    console.log(`[Test Mode] Applying ${testMode.delay}ms delay...`);
    await simulateDelay(testMode.delay);
  }

  if (testMode.error) {
    console.log(`[Test Mode] Throwing error: ${testMode.errorMessage}`);
    throw new Error(testMode.errorMessage);
  }
};

/**
 * Example usage in a Server Component:
 *
 * export default async function DashboardPage() {
 *   // Uncomment to test loading state (2 second delay)
 *   // await simulateDelay(2000);
 *
 *   // Uncomment to test error state
 *   // simulateError(1, "Failed to load dashboard data");
 *
 *   const data = await fetchData();
 *   return <Dashboard data={data} />;
 * }
 */

/**
 * Example usage in a Client Component with SWR:
 *
 * "use client";
 * import useSWR from 'swr';
 *
 * const fetcher = async (url) => {
 *   // Uncomment to test loading
 *   // await simulateDelay(2000);
 *
 *   // Uncomment to test error
 *   // simulateError(0.3, "Network request failed"); // 30% error rate
 *
 *   const res = await fetch(url);
 *   return res.json();
 * };
 *
 * export default function Component() {
 *   const { data, error, isLoading } = useSWR('/api/data', fetcher);
 *   // ...
 * }
 */

"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import AddUser from "./AddUser";
import CacheInspector from "./CacheInspector";

/**
 * Users Page with SWR
 *
 * Demonstrates:
 * - Client-side data fetching with SWR
 * - Automatic caching and revalidation
 * - Loading and error states
 * - Optimistic UI updates
 * - Cache inspection
 *
 * SWR Benefits:
 * - Returns cached data immediately (stale)
 * - Revalidates in background (while-revalidate)
 * - Updates UI when fresh data arrives
 * - Reduces perceived loading time
 */

export default function UsersPage() {
  // SWR Hook - fetches data with caching and revalidation
  const { data, error, isLoading, isValidating } = useSWR("/api/users", fetcher, {
    revalidateOnFocus: true, // Refetch when tab regains focus
    revalidateOnReconnect: true, // Refetch when connection is restored
    refreshInterval: 30000, // Poll every 30 seconds
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
    onSuccess: (data) => {
      console.log("🎉 SWR Success - Data loaded:", data);
    },
    onError: (error) => {
      console.error("💥 SWR Error:", error);
    },
  });

  // Loading state (first load, no cached data)
  if (isLoading) {
    return (
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Users (SWR)</h1>

          {/* Loading skeleton */}
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>

          <p className="mt-4 text-gray-600">⏳ Loading users... (Cache Miss - First Load)</p>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-red-600">Error Loading Users</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold">❌ Failed to load users</p>
            <p className="text-red-600 text-sm mt-2">{error.message}</p>
            <p className="text-gray-600 text-sm mt-2">Status: {error.status || "Unknown"}</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // Extract users array from response
  const users = data?.users || [];

  return (
    <main className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Users (SWR)</h1>
            <p className="text-gray-600 mt-1">
              Client-side data fetching with caching and revalidation
            </p>
          </div>

          {/* Validation indicator */}
          {isValidating && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Revalidating...</span>
            </div>
          )}
        </div>

        {/* Cache Inspector */}
        <CacheInspector />

        {/* Add User Component */}
        <AddUser />

        {/* User Count */}
        <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            📊 Total Users: <strong>{users.length}</strong>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            {isValidating
              ? "🔄 Checking for updates in background..."
              : "✅ Data is fresh (Cache Hit)"}
          </p>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-lg">No users found</p>
              <p className="text-gray-500 text-sm mt-2">Add your first user below</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-md transition-all bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>

                    <div className="flex gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {user.role || "Member"}
                      </span>
                      <span className="text-xs text-gray-500">ID: {user.id}</span>
                    </div>
                  </div>

                  <Link
                    href={`/users/${user.id}`}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SWR Info Panel */}
        <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="font-bold text-lg mb-3">🚀 SWR Features Demo</h2>

          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              ✅ <strong>Stale-While-Revalidate:</strong> Shows cached data immediately, refetches
              in background
            </li>
            <li>
              ✅ <strong>Revalidate on Focus:</strong> Refresh this tab to see automatic
              revalidation
            </li>
            <li>
              ✅ <strong>Polling:</strong> Data auto-refreshes every 30 seconds
            </li>
            <li>
              ✅ <strong>Optimistic UI:</strong> Add a user below to see instant updates
            </li>
            <li>
              ✅ <strong>Cache Inspection:</strong> Check cache keys and values above
            </li>
            <li>
              ✅ <strong>Deduplication:</strong> Multiple requests within 5s use same fetch
            </li>
          </ul>

          <div className="mt-4 p-3 bg-white rounded border border-gray-300">
            <p className="text-xs text-gray-600 mb-2">📝 Try these actions:</p>
            <ol className="text-xs text-gray-700 space-y-1 ml-4 list-decimal">
              <li>Switch to another tab, then come back (revalidate on focus)</li>
              <li>Add a new user (optimistic UI update)</li>
              <li>Open console to see cache hits/misses</li>
              <li>Wait 30s to see automatic polling</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}

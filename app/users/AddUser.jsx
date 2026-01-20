"use client";

import { useState } from "react";
import { mutate } from "swr";

/**
 * AddUser Component
 *
 * Demonstrates:
 * - Optimistic UI updates with SWR mutate
 * - Cache mutation before API call
 * - Revalidation after successful mutation
 *
 * Optimistic UI Flow:
 * 1. User clicks "Add User"
 * 2. Immediately add temporary user to cache (instant UI update)
 * 3. Send actual API request
 * 4. Revalidate to sync with server response
 * 5. If API fails, SWR auto-reverts the optimistic update
 */

export default function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddUser = async () => {
    if (!name || !email) {
      alert("Please enter both name and email");
      return;
    }

    setIsAdding(true);
    console.log("➕ Adding user (Optimistic UI):", { name, email });

    try {
      // Optimistic update - Update UI immediately before API call
      await mutate(
        "/api/users",
        async (currentData) => {
          // Create temporary user with optimistic ID
          const tempUser = {
            id: `temp-${Date.now()}`,
            name,
            email,
            role: "Member",
            createdAt: new Date().toISOString(),
            _isOptimistic: true, // Flag for debugging
          };

          console.log("🚀 Optimistic UI - Adding temporary user:", tempUser);

          // Add temp user to existing data
          const updatedUsers = [...(currentData?.users || []), tempUser];

          return {
            ...currentData,
            users: updatedUsers,
          };
        },
        false // Don't revalidate yet (keep optimistic data)
      );

      // Actual API call
      console.log("📡 Sending POST request to /api/users...");
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Failed to add user");
      }

      const result = await response.json();
      console.log("✅ User added successfully:", result);

      // Revalidate - Fetch fresh data from server
      console.log("🔄 Revalidating cache with server data...");
      await mutate("/api/users");

      // Clear form
      setName("");
      setEmail("");

      console.log("🎉 Optimistic UI complete - Cache synced with server");
    } catch (error) {
      console.error("❌ Failed to add user:", error);

      // SWR automatically reverts optimistic update on error
      // But we'll manually revalidate to be sure
      await mutate("/api/users");

      alert("Failed to add user: " + error.message);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="my-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
      <h2 className="text-xl font-bold mb-4">➕ Add New User (Optimistic UI)</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isAdding}
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={isAdding}
        />

        <button
          onClick={handleAddUser}
          disabled={isAdding || !name || !email}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isAdding ? "Adding..." : "Add User"}
        </button>
      </div>

      <div className="mt-4 p-3 bg-white rounded border border-purple-200">
        <p className="text-sm text-gray-700">
          <strong>🎯 Watch Optimistic UI:</strong>
        </p>
        <ol className="text-sm text-gray-600 mt-2 ml-4 space-y-1 list-decimal">
          <li>User appears instantly in list (before API completes)</li>
          <li>Temporary ID shown while waiting for server</li>
          <li>Real ID replaces temp ID after server response</li>
          <li>If API fails, user is automatically removed</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">💡 Open console to see optimistic update flow</p>
      </div>
    </div>
  );
}

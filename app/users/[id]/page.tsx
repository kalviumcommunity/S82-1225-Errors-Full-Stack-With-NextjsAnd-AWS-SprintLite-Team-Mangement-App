"use client";
/* eslint-disable */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserPageProps {
  params: {
    id: string;
  };
}

export default function UserPage({ params }: UserPageProps) {
  const { id } = params;
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/users?id=${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("User not found");
        }
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();

      // If the API returns a users array, find the specific user
      if (data.users && Array.isArray(data.users)) {
        const foundUser = data.users.find((u: User) => u.id === id);
        if (foundUser) {
          setUser(foundUser);
        } else {
          throw new Error("User not found");
        }
      } else if (data.id) {
        setUser(data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="p-8 min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">User Not Found</h2>
            <p className="text-red-700 mb-6">
              {error || "The user you are looking for does not exist."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                ← Go Back
              </button>
              <Link
                href="/users"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                View All Users
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/users" className="hover:text-gray-900">
            Users
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{user.name}</span>
        </nav>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with gradient */}
          <div className="h-32 bg-gradient-to-r from-purple-500 to-blue-500"></div>

          <div className="px-8 pb-8">
            {/* Avatar and basic info */}
            <div className="flex items-start gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <div className="w-28 h-28 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-4xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              <div className="flex-1 mt-16">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                  <span className="px-4 py-1 bg-purple-100 text-purple-700 font-medium rounded-full">
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {user.email}
                </p>
              </div>
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">User ID</div>
                <div className="font-mono text-sm text-gray-900">{user.id}</div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Account Type</div>
                <div className="text-gray-900">{user.role}</div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Member Since</div>
                <div className="text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Last Updated</div>
                <div className="text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back
              </button>
              <Link
                href="/users"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                View All Users
              </Link>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🔗 Dynamic Route:</strong> This page uses{" "}
            <code className="px-2 py-1 bg-blue-100 rounded">/users/[id]</code> to render
            user-specific content based on the URL parameter.
          </p>
        </div>
      </div>
    </main>
  );
}

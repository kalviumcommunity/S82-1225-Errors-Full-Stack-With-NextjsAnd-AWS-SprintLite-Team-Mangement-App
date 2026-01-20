"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import Cookies from "js-cookie";

export default function LoginPage() {
  const { login } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (loading) {
      console.log("Already loading, ignoring duplicate submission");
      return;
    }

    console.log("Form submitted!");
    console.log("Email:", email);
    console.log("Password:", password);

    setError("");
    setLoading(true);

    try {
      console.log("Sending login request...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log("Login response:", data);

      if (data.success && data.data) {
        console.log("Login successful!");
        console.log("Token:", data.data.token.substring(0, 20) + "...");

        // Store token in localStorage
        localStorage.setItem("token", data.data.token);
        console.log("Token saved to localStorage");

        // Store user info in cookie for display
        const expireDays = rememberMe ? 7 : 1;
        Cookies.set("user", JSON.stringify(data.data.user), {
          expires: expireDays,
          path: "/",
          sameSite: "lax",
        });
        console.log("User cookie set");

        // Also set token cookie for middleware (non-httpOnly for now)
        Cookies.set("token", data.data.token, {
          expires: expireDays,
          path: "/",
          sameSite: "lax",
        });
        console.log("Token cookie set:", Cookies.get("token") ? "SUCCESS" : "FAILED");

        // Update AuthContext
        login(data.data.user.name, data.data.user.email);
        console.log("AuthContext updated");

        console.log("Waiting 500ms before redirect...");
        setTimeout(() => {
          console.log("Redirecting to dashboard NOW");
          window.location.href = "/dashboard";
        }, 500);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SprintLite</h1>
          <p className="text-gray-400 text-sm">Sprint management for engineering teams</p>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to SprintLite</h2>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800 p-3">
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-700 bg-gray-900 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link
                href="/auth/forgot-password"
                className="font-medium text-blue-500 hover:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {loading ? "Signing in..." : "Sign in to SprintLite"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium text-blue-500 hover:text-blue-400">
              Create one
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-500 mt-8">
          © 2024 SprintLite. All rights reserved.
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-950 text-gray-500">Test Credentials</span>
            </div>
          </div>
          <div className="mt-3 bg-gray-900 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 text-center space-y-1">
            <p>
              <span className="text-gray-500">Email:</span>{" "}
              <span className="text-gray-300">mohit@sprintlite.com</span>
            </p>
            <p>
              <span className="text-gray-500">Password:</span>{" "}
              <span className="text-gray-300">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

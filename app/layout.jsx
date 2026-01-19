"use client";
/* eslint-disable */

import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const isActive = (path) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  // Don't show navigation on login page
  const showNav = pathname !== "/login";

  return (
    <html lang="en">
      <head>
        <title>SprintLite - Task Management</title>
        <meta
          name="description"
          content="Modern task management platform with powerful routing, authentication, and team collaboration features"
        />
        <meta
          name="keywords"
          content="task management, Next.js, routing, authentication, team collaboration"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {showNav && (
          <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                >
                  <span>🚀</span>
                  <span>SprintLite</span>
                </Link>

                {/* Main Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                  <Link
                    href="/"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/") && pathname === "/"
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Home
                  </Link>

                  <Link
                    href="/dashboard"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/dashboard")
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/users"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/users")
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Users
                  </Link>

                  <Link
                    href="/tasks-overview"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/tasks-overview")
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Tasks
                  </Link>

                  <Link
                    href="/about"
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      isActive("/about")
                        ? "bg-purple-100 text-purple-700 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    About
                  </Link>
                </div>

                {/* Auth Actions */}
                <div className="flex items-center space-x-3">
                  {isAuthenticated ? (
                    <>
                      <span className="text-sm text-gray-600 hidden sm:inline">Logged in</span>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all text-sm font-medium"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Main Content */}
        <div className="min-h-[calc(100vh-4rem)]">{children}</div>

        {/* Footer */}
        {showNav && (
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  © 2024 SprintLite. Built with Next.js App Router.
                </div>
                <div className="flex gap-6 text-sm">
                  <Link href="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                  <Link href="/about" className="text-gray-600 hover:text-gray-900">
                    About
                  </Link>
                  <a
                    href="https://nextjs.org/docs"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Docs
                  </a>
                </div>
              </div>
            </div>
          </footer>
        )}
      </body>
    </html>
  );
}

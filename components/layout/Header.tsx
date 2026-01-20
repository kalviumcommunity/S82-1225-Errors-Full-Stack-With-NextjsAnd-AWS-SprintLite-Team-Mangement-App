"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useState, useEffect } from "react";

/**
 * Header Component
 *
 * A reusable header component that provides:
 * - Application branding
 * - Main navigation links
 * - Authentication status display
 * - Logout functionality
 *
 * Props: None (uses global auth state via cookies)
 *
 * Accessibility:
 * - Semantic <nav> element
 * - Keyboard navigable links
 * - ARIA labels for interactive elements
 * - Focus visible styles
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAuthenticated(!!token);
  }, [pathname]);

  const handleLogout = () => {
    Cookies.remove("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            aria-label="SprintLite Home"
          >
            <span role="img" aria-label="rocket">
              🚀
            </span>
            <span>SprintLite</span>
          </Link>

          {/* Main Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isActive("/") && pathname === "/"
                  ? "bg-purple-100 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={pathname === "/" ? "page" : undefined}
            >
              Home
            </Link>

            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isActive("/dashboard")
                  ? "bg-purple-100 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={isActive("/dashboard") ? "page" : undefined}
            >
              Dashboard
            </Link>

            <Link
              href="/users"
              className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isActive("/users")
                  ? "bg-purple-100 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={isActive("/users") ? "page" : undefined}
            >
              Users
            </Link>

            <Link
              href="/tasks-overview"
              className={`px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                isActive("/tasks-overview")
                  ? "bg-purple-100 text-purple-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              aria-current={isActive("/tasks-overview") ? "page" : undefined}
            >
              Tasks
            </Link>
          </nav>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">Authenticated</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Login"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

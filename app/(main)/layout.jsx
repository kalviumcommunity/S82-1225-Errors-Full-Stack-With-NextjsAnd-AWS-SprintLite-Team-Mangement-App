"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthContext();

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row">
      {/* Sidebar - Hidden on mobile, visible on lg+ */}
      <aside className="hidden lg:flex lg:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-gray-900 dark:text-white font-bold">SprintLite</h1>
              <p className="text-gray-500 dark:text-gray-500 text-xs">Your workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/tasks"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>All Tasks</span>
          </Link>

          <Link
            href="/tasks/new"
            className="w-full flex items-center gap-3 px-4 py-3 text-brand hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Create Task</span>
          </Link>
        </nav>

        {/* Settings at Bottom */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - Mobile friendly */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          {/* Search - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search tasks..."
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Mobile: Logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">⚡</span>
            </div>
            <h1 className="text-gray-900 dark:text-white font-bold">SprintLite</h1>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Avatar */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg px-2 lg:px-3 py-2 transition-colors"
            >
              <div className="w-8 h-8 bg-brand rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {getInitials(user?.name)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-gray-900 dark:text-white text-sm font-medium">
                  {user?.name || "User"}
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">{children}</main>
      </div>
    </div>
  );
}

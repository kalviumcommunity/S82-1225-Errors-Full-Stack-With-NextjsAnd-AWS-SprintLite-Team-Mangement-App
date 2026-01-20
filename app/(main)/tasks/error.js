"use client";

import { useEffect } from "react";

/**
 * Tasks Table Error Boundary
 *
 * Catches errors during tasks data fetching or rendering.
 * Provides user-friendly fallback UI with retry functionality.
 * Automatically implemented by Next.js App Router.
 *
 * @param {Object} props
 * @param {Error} props.error - The error that was thrown
 * @param {Function} props.reset - Function to re-render the route segment
 */
export default function TasksError({ error, reset }) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Tasks page error:", error);

    // Here you could also send to an error tracking service
    // logErrorToService(error);
  }, [error]);

  return (
    <div className="min-h-[600px] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to Load Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We encountered an error while fetching your tasks. This could be due to a network
            connectivity issue or a server problem.
          </p>

          {/* Error Details (Development Mode) */}
          {process.env.NODE_ENV === "development" && (
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs text-red-600 dark:text-red-400 font-mono overflow-auto max-h-64">
                <p className="font-semibold mb-1">Error Message:</p>
                <p className="mb-2">{error.message}</p>
                {error.digest && (
                  <>
                    <p className="font-semibold mb-1">Error Digest:</p>
                    <p className="mb-2">{error.digest}</p>
                  </>
                )}
                {error.stack && (
                  <>
                    <p className="font-semibold mb-1">Stack Trace:</p>
                    <pre className="whitespace-pre-wrap">{error.stack}</pre>
                  </>
                )}
              </div>
            </details>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Retry Button */}
          <button
            onClick={() => {
              console.log("Retrying tasks fetch...");
              reset();
            }}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </span>
          </button>

          {/* Back to Dashboard */}
          <a
            href="/dashboard"
            className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Go to Dashboard
          </a>
        </div>

        {/* Help Actions */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
            Troubleshooting steps:
          </p>
          <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Check your internet connection
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Refresh the page (F5)
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Clear browser cache and cookies
            </li>
          </ul>
        </div>

        {/* Contact Support */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Still having issues?{" "}
          <a
            href="mailto:support@sprintlite.com"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="alert" aria-live="assertive">
        An error occurred while loading tasks. Please try again or contact support.
      </div>
    </div>
  );
}

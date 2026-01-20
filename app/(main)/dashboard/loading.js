/**
 * Dashboard Loading State
 *
 * Displays skeleton UI while dashboard data is being fetched.
 * Automatically shown by Next.js App Router during Suspense boundaries.
 */
export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="mb-6 lg:mb-8">
        <div className="h-8 w-48 bg-gray-700 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-64 bg-gray-800 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>

      {/* Kanban Board Skeleton - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Column 1: Todo */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <div className="h-5 w-24 bg-gray-700 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-800 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Task Cards Skeleton */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              {/* Task Title */}
              <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>

              {/* Task Description */}
              <div className="space-y-2 mb-3">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>

              {/* Task Meta (Priority, Assignee) */}
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div className="h-5 w-32 bg-gray-700 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-800 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Task Cards Skeleton */}
          {[1, 2].map((i) => (
            <div
              key={i}
              className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
              <div className="space-y-2 mb-3">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-4/5 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Column 3: Done */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
          {/* Column Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="h-5 w-20 bg-gray-700 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-8 bg-gray-800 dark:bg-gray-800 rounded animate-pulse"></div>
          </div>

          {/* Task Cards Skeleton */}
          {[1].map((i) => (
            <div
              key={i}
              className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-3"></div>
              <div className="space-y-2 mb-3">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading dashboard data...
      </div>
    </div>
  );
}

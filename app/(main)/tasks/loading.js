/**
 * Tasks Table Loading State
 *
 * Displays skeleton UI while tasks table data is being fetched.
 * Automatically shown by Next.js App Router during Suspense boundaries.
 */
export default function TasksLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-4">
        <div>
          <div className="h-8 w-32 bg-gray-700 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gray-800 dark:bg-gray-800 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-blue-600/50 rounded-lg animate-pulse"></div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <div className="h-4 w-16 bg-gray-800 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
          <div className="h-10 w-40 bg-gray-700 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div>
          <div className="h-4 w-16 bg-gray-800 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
          <div className="h-10 w-40 bg-gray-700 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-12 gap-4 px-6 py-4">
            <div className="col-span-4">
              <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="col-span-2">
              <div className="h-4 w-16 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-6 py-4 animate-pulse">
              {/* Task Title + Description */}
              <div className="col-span-4">
                <div className="h-5 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center">
                <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>

              {/* Priority Badge */}
              <div className="col-span-2 flex items-center">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>

              {/* Assignee */}
              <div className="col-span-2 flex items-center">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Stats Skeleton */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 animate-pulse"
          >
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-400 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>

      {/* Screen Reader Announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Loading tasks data...
      </div>
    </div>
  );
}

import Link from "next/link";

export default function AllTasksPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Tasks</h1>
          <p className="text-gray-400">8 tasks</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors flex items-center gap-2">
          <span>⚡</span>
          Status
        </button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors flex items-center gap-2">
          <span>🎯</span>
          Priority
        </button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors flex items-center gap-2">
          <span>👤</span>
          Assignee
        </button>
        <button className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors flex items-center gap-2">
          <span>↕️</span>
          Sort
        </button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800 border-b border-gray-700">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Task</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Assignee</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Priority</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {/* Task Row 1 */}
            <tr className="hover:bg-gray-850 cursor-pointer transition-colors">
              <td className="px-6 py-4">
                <Link href="/tasks/1" className="text-blue-400 hover:text-blue-300 font-medium">
                  Design authentication flow
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    AC
                  </div>
                  <span className="text-gray-300">Alex Chen</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  In Progress
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">High</span>
              </td>
              <td className="px-6 py-4 text-gray-300">Jan 25</td>
            </tr>

            {/* Task Row 2 */}
            <tr className="hover:bg-gray-850 cursor-pointer transition-colors">
              <td className="px-6 py-4">
                <Link href="/tasks/2" className="text-blue-400 hover:text-blue-300 font-medium">
                  Setup database schema
                </Link>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    JS
                  </div>
                  <span className="text-gray-300">Jordan Smith</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center gap-1 text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  In Progress
                </span>
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">High</span>
              </td>
              <td className="px-6 py-4 text-gray-300">-</td>
            </tr>

            {/* Add more rows as needed */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

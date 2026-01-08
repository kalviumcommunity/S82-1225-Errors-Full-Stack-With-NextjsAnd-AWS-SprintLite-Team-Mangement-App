export default function DashboardPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Sprint Dashboard</h1>
        <p className="text-gray-400">Track and manage your tasks across the sprint</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 gap-6">
        {/* Todo Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
              Todo
              <span className="text-gray-500 text-sm">(2)</span>
            </h2>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {/* Task Card 1 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
              <h3 className="text-white font-medium mb-2">Create task API endpoints</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    SJ
                  </div>
                  <span className="text-gray-400 text-sm">Sam Johnson</span>
                </div>
                <span className="px-2 py-1 bg-orange-900 text-orange-300 text-xs rounded">Medium</span>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
              <h3 className="text-white font-medium mb-2">Write unit tests for auth</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    AC
                  </div>
                  <span className="text-gray-400 text-sm">Alex Chen</span>
                </div>
                <span className="px-2 py-1 bg-orange-900 text-orange-300 text-xs rounded">Medium</span>
              </div>
            </div>
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              In Progress
              <span className="text-gray-500 text-sm">(2)</span>
            </h2>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {/* Task Card 1 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-blue-700 hover:border-blue-600 cursor-pointer transition-colors">
              <h3 className="text-white font-medium mb-2">Design authentication flow</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    AC
                  </div>
                  <span className="text-gray-400 text-sm">Alex Chen</span>
                </div>
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">High</span>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-blue-700 hover:border-blue-600 cursor-pointer transition-colors">
              <h3 className="text-white font-medium mb-2">Setup database schema</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    JS
                  </div>
                  <span className="text-gray-400 text-sm">Jordan Smith</span>
                </div>
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">High</span>
              </div>
            </div>
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-900 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Done
              <span className="text-gray-500 text-sm">(2)</span>
            </h2>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {/* Task Card 1 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors opacity-75">
              <h3 className="text-white font-medium mb-2">Deploy to staging</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    CW
                  </div>
                  <span className="text-gray-400 text-sm">Casey Williams</span>
                </div>
                <span className="px-2 py-1 bg-red-900 text-red-300 text-xs rounded">High</span>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors opacity-75">
              <h3 className="text-white font-medium mb-2">Review pull requests</h3>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    JS
                  </div>
                  <span className="text-gray-400 text-sm">Jordan Smith</span>
                </div>
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">Low</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

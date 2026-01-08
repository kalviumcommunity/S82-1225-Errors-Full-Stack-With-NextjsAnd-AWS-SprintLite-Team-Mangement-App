export default function TaskDetailPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <button className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <span>←</span>
        <span>Back</span>
      </button>

      <div className="grid grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">Design authentication flow</h1>
              <button className="text-gray-400 hover:text-white">⋯</button>
            </div>
            <p className="text-gray-500 text-sm">Task #1</p>
          </div>

          {/* Description */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-3">Description</h2>
            <p className="text-gray-300 leading-relaxed">
              Create a comprehensive authentication system that supports email, password, and OAuth providers.
              Should include forgot password, 2FA, and rate limiting.
            </p>
          </div>

          {/* Activity Feed */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-white font-semibold mb-4">Activity</h2>
            <div className="space-y-4">
              {/* Activity Item 1 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  AC
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Alex Chen</p>
                  <p className="text-gray-400 text-sm">Jan 17, 02:45 PM</p>
                  <p className="text-gray-300 mt-1">Started working on the OAuth integration</p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  JS
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">Jordan Smith</p>
                  <p className="text-gray-400 text-sm">Jan 17, 08:00 PM</p>
                  <p className="text-gray-300 mt-1">Can we also add support for WebAuthn?</p>
                </div>
              </div>
            </div>

            {/* Add Comment */}
            <div className="mt-6">
              <input
                type="text"
                placeholder="Share your thoughts..."
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">STATUS</p>
            <button className="w-full px-3 py-2 bg-gray-800 text-blue-400 rounded-lg border border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                In Progress
              </span>
              <span>▼</span>
            </button>
          </div>

          {/* Priority */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">PRIORITY</p>
            <button className="w-full px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-red-400">🚨</span>
                High
              </span>
              <span className="text-gray-400">▼</span>
            </button>
          </div>

          {/* Assigned To */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">ASSIGNED TO</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                AC
              </div>
              <div>
                <p className="text-white font-medium">Alex Chen</p>
              </div>
            </div>
          </div>

          {/* Due Date */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">DUE DATE</p>
            <p className="text-white">Jan 25, 2024</p>
          </div>

          {/* Created */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">CREATED</p>
            <p className="text-white">Jan 15, 04:00 PM</p>
            <p className="text-gray-400 text-sm">by Admin User</p>
          </div>

          {/* Last Updated */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm mb-2">LAST UPDATED</p>
            <p className="text-white">Jan 18, 07:52 PM</p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-750 text-white rounded-lg border border-gray-700 transition-colors flex items-center justify-center gap-2">
              <span>✏️</span>
              Edit Task
            </button>
            <button className="w-full px-4 py-2 bg-red-900 hover:bg-red-800 text-red-300 rounded-lg border border-red-800 transition-colors flex items-center justify-center gap-2">
              <span>🗑️</span>
              Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

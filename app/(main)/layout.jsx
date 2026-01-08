import Link from 'next/link';

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-white font-bold">SprintLite</h1>
              <p className="text-gray-500 text-xs">Your workspace</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-white bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
          >
            <span className="text-xl">📊</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/tasks"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="text-xl">✓</span>
            <span>All Tasks</span>
          </Link>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-500 hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-xl">+</span>
            <span>Create Task</span>
          </button>
        </nav>

        {/* Settings at Bottom */}
        <div className="p-4 border-t border-gray-800">
          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <span className="text-xl">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <input
              type="search"
              placeholder="Search tasks..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* User Avatar */}
            <button className="flex items-center gap-2 hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                JD
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">John Developer</p>
                <p className="text-gray-400 text-xs">john@example.com</p>
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center max-w-3xl">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Welcome to SprintLite 🚀
        </h1>
        <p className="text-xl mb-8 text-gray-700">
          A modern task management platform for small teams with powerful features
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">📋</div>
            <h3 className="font-semibold mb-2">Task Management</h3>
            <p className="text-sm text-gray-600">Organize and track tasks efficiently</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">👥</div>
            <h3 className="font-semibold mb-2">Team Collaboration</h3>
            <p className="text-sm text-gray-600">Work together seamlessly</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">Track progress and insights</p>
          </div>
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/login"
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            Get Started →
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-all shadow-lg border border-gray-200"
          >
            Dashboard
          </Link>
          <Link
            href="/users/1"
            className="px-8 py-3 bg-white text-gray-800 rounded-lg hover:bg-gray-50 transition-all shadow-lg border border-gray-200"
          >
            Browse Users
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p>
            Navigate to{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              /login
            </Link>{" "}
            to sign in or visit{" "}
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              /dashboard
            </Link>{" "}
            (protected route)
          </p>
        </div>
      </div>
    </main>
  );
}

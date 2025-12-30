export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SprintLite</h1>
        <p className="text-xl mb-8">A lightweight task management tool for small teams</p>
        <div className="flex gap-4 justify-center">
          <a 
            href="/dashboard" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Dashboard
          </a>
          <a 
            href="/tasks-overview" 
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            View Tasks Overview
          </a>
          <a 
            href="/about" 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
          >
            About
          </a>
        </div>
      </div>
    </main>
  );
}

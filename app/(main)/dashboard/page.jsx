"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

/**
 * Dashboard Page - Kanban Board View
 *
 * Displays tasks grouped by status (Todo, InProgress, Done)
 * Uses SWR for real-time data fetching with caching
 * Connected to /api/tasks endpoint
 */

// Get avatar color based on name hash
const getAvatarColor = (name) => {
  if (!name) return "bg-gray-600";
  const colors = [
    "bg-green-600",
    "bg-blue-600",
    "bg-purple-600",
    "bg-orange-600",
    "bg-pink-600",
    "bg-teal-600",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Column component for Kanban board
const Column = ({ title, tasks, dotColor, TaskComponent }) => (
  <div className="bg-gray-900 rounded-lg p-4">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-white font-semibold flex items-center gap-2">
        <span className={`w-2 h-2 ${dotColor} rounded-full`}></span>
        {title}
        <span className="text-gray-500 text-sm">({tasks.length})</span>
      </h2>
    </div>

    <div className="space-y-3">
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks</p>
        </div>
      ) : (
        tasks.map((task) => <TaskComponent key={task.id} task={task} />)
      )}
    </div>
  </div>
);

export default function DashboardPage() {
  const { isAuthenticated, userName } = useAuth();

  // Fetch all tasks with SWR
  const { data, error, isLoading } = useSWR("/api/tasks?limit=100", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  // Debug logging
  console.log("🔍 Dashboard SWR state:", {
    isLoading,
    hasError: !!error,
    hasData: !!data,
    taskCount: data?.tasks?.length,
    rawData: data,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-900 rounded-lg p-4 h-96"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <p className="text-red-300">Failed to load tasks: {error.message}</p>
        </div>
      </div>
    );
  }

  const tasks = data?.tasks || [];

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "Todo");
  const inProgressTasks = tasks.filter((t) => t.status === "InProgress");
  const doneTasks = tasks.filter((t) => t.status === "Done");

  // Redefine helper function inside component to access getAvatarColor
  const TaskCardInner = ({ task }) => {
    const priorityColors = {
      High: "bg-red-900 text-red-300",
      Medium: "bg-orange-900 text-orange-300",
      Low: "bg-gray-700 text-gray-300",
    };

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    // Generate consistent avatar color based on user name
    const getAvatarColor = (name) => {
      if (!name) return "bg-gray-600";
      const colors = [
        "bg-green-500", // Green
        "bg-blue-500", // Blue
        "bg-purple-500", // Purple
        "bg-orange-500", // Orange
        "bg-pink-500", // Pink
        "bg-teal-500", // Teal
      ];
      const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };

    const userName = task.assignee?.name || task.creator?.name;
    const avatarColor = getAvatarColor(userName);

    return (
      <Link href={`/tasks/${task.id}`}>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 cursor-pointer transition-colors">
          <h3 className="text-white font-medium mb-2 line-clamp-2">{task.title}</h3>

          {task.description && (
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-semibold`}
              >
                {getInitials(userName)}
              </div>
              <span className="text-gray-400 text-sm">{userName || "Unassigned"}</span>
            </div>
            <span
              className={`px-2 py-1 text-xs rounded ${priorityColors[task.priority] || priorityColors.Low}`}
            >
              {task.priority}
            </span>
          </div>

          {task.dueDate && (
            <div className="mt-2 text-xs text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </Link>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Sprint Dashboard
          {isAuthenticated && userName && (
            <span className="text-gray-400 text-xl ml-3">Welcome, {userName}!</span>
          )}
        </h1>
        <p className="text-gray-400">
          Track and manage your tasks across the sprint • {tasks.length} total tasks
        </p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Column
          title="Todo"
          tasks={todoTasks}
          dotColor="bg-gray-500"
          TaskComponent={TaskCardInner}
        />
        <Column
          title="In Progress"
          tasks={inProgressTasks}
          dotColor="bg-blue-500"
          TaskComponent={TaskCardInner}
        />
        <Column
          title="Done"
          tasks={doneTasks}
          dotColor="bg-green-500"
          TaskComponent={TaskCardInner}
        />
      </div>

      {/* Create Task Button */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/tasks/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>Create New Task</span>
        </Link>
      </div>
    </div>
  );
}

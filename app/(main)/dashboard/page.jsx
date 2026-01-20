"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";
import toast from "react-hot-toast";

/**
 * Dashboard Page - Kanban Board View
 *
 * Displays tasks grouped by status (Todo, InProgress, Done)
 * Uses SWR for real-time data fetching with caching
 * Connected to /api/tasks endpoint
 */

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
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all tasks with SWR
  const { data, error, isLoading, mutate } = useSWR("/api/tasks?limit=100", fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
  });

  // Handle delete task
  const handleDeleteTask = async () => {
    if (!deleteModal.task) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting task...");

    try {
      const response = await fetch(`/api/tasks/${deleteModal.task.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete task");
      }

      toast.success("Task deleted successfully!", { id: loadingToast });

      // Refresh the task list
      mutate();

      // Close modal
      setDeleteModal({ isOpen: false, task: null });
    } catch (err) {
      toast.error(err.message || "Failed to delete task", { id: loadingToast });
    } finally {
      setIsDeleting(false);
    }
  };

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
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader size="lg" text="Loading dashboard..." />
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
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors group">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/tasks/${task.id}`} className="flex-1">
            <h3 className="text-white font-medium line-clamp-2 group-hover:text-blue-400 transition-colors">
              {task.title}
            </h3>
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteModal({ isOpen: true, task });
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-1 hover:bg-red-900/50 rounded text-red-400 hover:text-red-300"
            aria-label="Delete task"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>

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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => !isDeleting && setDeleteModal({ isOpen: false, task: null })}
        title="Delete Task"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-300">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">&quot;{deleteModal.task?.title}&quot;</span>?
          </p>
          <p className="text-sm text-gray-400">This action cannot be undone.</p>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDeleteTask}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
            <button
              onClick={() => setDeleteModal({ isOpen: false, task: null })}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

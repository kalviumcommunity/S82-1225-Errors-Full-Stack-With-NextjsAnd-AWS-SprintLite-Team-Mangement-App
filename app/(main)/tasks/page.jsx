"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { useState } from "react";

/**
 * All Tasks Page - Table View
 *
 * Displays all tasks in a filterable table
 * Uses SWR for real-time data fetching
 * Connected to /api/tasks endpoint
 */

export default function AllTasksPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Fetch all tasks with SWR
  const { data, error, isLoading } = useSWR("/api/tasks?limit=100", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-800 rounded"></div>
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

  let tasks = data?.tasks || [];

  // Apply filters
  if (statusFilter !== "all") {
    tasks = tasks.filter((t) => t.status === statusFilter);
  }
  if (priorityFilter !== "all") {
    tasks = tasks.filter((t) => t.priority === priorityFilter);
  }

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const statusColors = {
    Todo: "text-gray-400",
    InProgress: "text-blue-400",
    Done: "text-green-400",
  };

  const priorityBadges = {
    High: "bg-red-900 text-red-300",
    Medium: "bg-orange-900 text-orange-300",
    Low: "bg-gray-700 text-gray-300",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Tasks</h1>
          <p className="text-gray-400">{tasks.length} tasks</p>
        </div>
        <Link
          href="/tasks/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Create Task
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <option value="all">All Status</option>
          <option value="Todo">Todo</option>
          <option value="InProgress">In Progress</option>
          <option value="Done">Done</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 hover:bg-gray-750 transition-colors"
        >
          <option value="all">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No tasks found
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-850 cursor-pointer transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/tasks/${task.id}`}
                      className="text-blue-400 hover:text-blue-300 font-medium"
                    >
                      {task.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {getInitials(task.assignee?.name || task.creator?.name)}
                      </div>
                      <span className="text-gray-300">
                        {task.assignee?.name || task.creator?.name || "Unassigned"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 ${statusColors[task.status]}`}>
                      <span
                        className={`w-2 h-2 rounded-full ${
                          task.status === "Todo"
                            ? "bg-gray-400"
                            : task.status === "InProgress"
                              ? "bg-blue-500"
                              : "bg-green-500"
                        }`}
                      ></span>
                      {task.status === "InProgress" ? "In Progress" : task.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${priorityBadges[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useAuth } from "@/hooks/useAuth";
import { useUI } from "@/hooks/useUI";
import { Button } from "@/components";
import { useEffect } from "react";

/**
 * State Management Demo Page
 *
 * Demonstrates the use of Context API and custom hooks for global state management.
 *
 * Features:
 * - Authentication state (login/logout)
 * - Theme toggling (light/dark mode)
 * - Sidebar controls
 * - Modal management
 * - Notification system
 * - Console logging for state transitions
 */
export default function StateManagementDemo() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  const {
    theme,
    toggleTheme,
    isDarkMode,
    sidebarOpen,
    toggleSidebar,
    modalOpen,
    toggleModal,
    notifications,
    addNotification,
    removeNotification,
    notificationCount,
  } = useUI();

  // Log state changes
  useEffect(() => {
    console.log("🔄 State Update - Auth:", { isAuthenticated, user: user?.name });
  }, [isAuthenticated, user]);

  useEffect(() => {
    console.log("🔄 State Update - Theme:", theme);
  }, [theme]);

  useEffect(() => {
    console.log("🔄 State Update - Sidebar:", sidebarOpen ? "Open" : "Closed");
  }, [sidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading authentication state...</div>
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen p-8 transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-900 text-white"
          : "bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">State Management with Context & Hooks</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Demonstrating React Context API, Custom Hooks, and Global State
          </p>
        </header>

        {/* Authentication Section */}
        <section className={`p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🔐 Authentication State
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="font-medium">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAuthenticated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {isAuthenticated ? "✅ Authenticated" : "❌ Not Authenticated"}
              </span>
            </div>

            {isAuthenticated ? (
              <div className="space-y-3">
                <div>
                  <span className="font-medium">User:</span> {user?.name}
                </div>
                <div>
                  <span className="font-medium">Email:</span> {user?.email}
                </div>
                <div>
                  <span className="font-medium">ID:</span>{" "}
                  <code
                    className={`px-2 py-1 rounded text-sm ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    {user?.id}
                  </code>
                </div>
                <Button label="Logout" variant="danger" onClick={logout} />
              </div>
            ) : (
              <div className="space-y-3">
                <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  You are not logged in. Try logging in as one of these users:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    label="Login as John Doe"
                    variant="primary"
                    onClick={() => login("John Doe", "john@example.com")}
                  />
                  <Button
                    label="Login as Jane Smith"
                    variant="primary"
                    onClick={() => login("Jane Smith", "jane@example.com")}
                  />
                  <Button
                    label="Login as Bob Wilson"
                    variant="primary"
                    onClick={() => login("Bob Wilson", "bob@example.com")}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* UI Controls Section */}
        <section className={`p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🎨 UI State Controls
          </h2>

          <div className="space-y-6">
            {/* Theme Control */}
            <div>
              <h3 className="text-lg font-medium mb-2">Theme</h3>
              <div className="flex items-center gap-4">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Current: <strong>{theme}</strong> mode
                </span>
                <Button
                  label={`Switch to ${isDarkMode ? "Light" : "Dark"} Mode`}
                  variant={isDarkMode ? "secondary" : "primary"}
                  onClick={toggleTheme}
                />
              </div>
            </div>

            {/* Sidebar Control */}
            <div>
              <h3 className="text-lg font-medium mb-2">Sidebar</h3>
              <div className="flex items-center gap-4">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Status: <strong>{sidebarOpen ? "Open" : "Closed"}</strong>
                </span>
                <Button
                  label={sidebarOpen ? "Close Sidebar" : "Open Sidebar"}
                  variant="secondary"
                  onClick={toggleSidebar}
                />
              </div>
            </div>

            {/* Modal Control */}
            <div>
              <h3 className="text-lg font-medium mb-2">Modal</h3>
              <div className="flex items-center gap-4">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                  Status: <strong>{modalOpen ? "Open" : "Closed"}</strong>
                </span>
                <Button
                  label={modalOpen ? "Close Modal" : "Open Modal"}
                  variant="secondary"
                  onClick={toggleModal}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className={`p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            🔔 Notification System
            {notificationCount > 0 && (
              <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded-full">
                {notificationCount}
              </span>
            )}
          </h2>

          <div className="space-y-4">
            {/* Add Notification Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                label="Success Notification"
                variant="success"
                size="sm"
                onClick={() => addNotification("Operation completed successfully!", "success")}
              />
              <Button
                label="Error Notification"
                variant="danger"
                size="sm"
                onClick={() => addNotification("Something went wrong!", "error")}
              />
              <Button
                label="Info Notification"
                variant="primary"
                size="sm"
                onClick={() => addNotification("Here's some useful information", "info")}
              />
              <Button
                label="Warning Notification"
                variant="secondary"
                size="sm"
                onClick={() => addNotification("Please be careful with this action", "warning")}
              />
            </div>

            {/* Notifications List */}
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg flex items-start justify-between ${
                      notification.type === "success"
                        ? "bg-green-100 text-green-800"
                        : notification.type === "error"
                          ? "bg-red-100 text-red-800"
                          : notification.type === "warning"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <div className="flex-1">
                      <span className="font-medium">{notification.type.toUpperCase()}:</span>{" "}
                      {notification.message}
                    </div>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="ml-4 text-lg hover:opacity-70"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                No notifications. Click a button above to add one.
              </p>
            )}
          </div>
        </section>

        {/* Console Logs Section */}
        <section className={`p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">📝 Console Logs</h2>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            Open your browser&apos;s developer console (F12) to see state transition logs:
          </p>
          <ul
            className={`mt-3 space-y-1 list-disc list-inside ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
          >
            <li>✅ User logged in/out</li>
            <li>🎨 Theme toggled</li>
            <li>📱 Sidebar opened/closed</li>
            <li>🔲 Modal opened/closed</li>
            <li>🔔 Notifications added/removed</li>
            <li>🔄 State updates</li>
          </ul>
        </section>

        {/* Benefits Section */}
        <section className={`p-6 rounded-lg shadow-lg ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <h2 className="text-2xl font-semibold mb-4">✨ Benefits of This Approach</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>No Prop Drilling:</strong> Access state anywhere without passing props
                through multiple levels
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Clean API:</strong> Custom hooks provide simple interfaces
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Performance:</strong> Memoized values prevent unnecessary re-renders
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Persistence:</strong> Auth state saved in cookies, theme in localStorage
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 font-bold">✓</span>
              <span>
                <strong>Scalability:</strong> Easy to add new context providers as app grows
              </span>
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

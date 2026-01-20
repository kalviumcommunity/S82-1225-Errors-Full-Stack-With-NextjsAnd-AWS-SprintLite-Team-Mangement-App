import { useUIContext } from "@/context/UIContext";

/**
 * useUI Hook
 *
 * Custom hook that provides UI state and methods.
 * Simplifies access to UI context with a clean API.
 *
 * @example
 * const { theme, toggleTheme, sidebarOpen, toggleSidebar } = useUI();
 *
 * return (
 *   <div className={theme === "dark" ? "dark-mode" : "light-mode"}>
 *     <button onClick={toggleTheme}>Toggle Theme</button>
 *     <button onClick={toggleSidebar}>Toggle Sidebar</button>
 *   </div>
 * );
 */
export function useUI() {
  const {
    theme,
    toggleTheme,
    setTheme,
    sidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    modalOpen,
    toggleModal,
    notifications,
    addNotification,
    removeNotification,
  } = useUIContext();

  return {
    // Theme
    theme,
    toggleTheme,
    setTheme,
    isDarkMode: theme === "dark",
    isLightMode: theme === "light",

    // Sidebar
    sidebarOpen,
    toggleSidebar,
    openSidebar,
    closeSidebar,

    // Modal
    modalOpen,
    toggleModal,

    // Notifications
    notifications,
    addNotification,
    removeNotification,
    hasNotifications: notifications.length > 0,
    notificationCount: notifications.length,
  };
}

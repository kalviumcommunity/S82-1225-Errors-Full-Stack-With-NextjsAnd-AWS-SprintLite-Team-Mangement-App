"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

/**
 * UIContext
 *
 * Provides global UI state management across the application.
 *
 * Features:
 * - Theme toggling (light/dark mode)
 * - Sidebar open/close state
 * - Modal management
 * - Notification system
 * - Persistent theme preference via localStorage
 *
 * Performance:
 * - Uses useReducer for complex state updates
 * - Memoized context value
 * - Only re-renders when UI state changes
 */

const UIContext = createContext(undefined);

// Reducer for complex UI state management
function uiReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_THEME":
      const newTheme = state.theme === "light" ? "dark" : "light";
      console.log(`🎨 Theme toggled to: ${newTheme}`);
      return { ...state, theme: newTheme };

    case "SET_THEME":
      console.log(`🎨 Theme set to: ${action.payload}`);
      return { ...state, theme: action.payload };

    case "TOGGLE_SIDEBAR":
      console.log(`📱 Sidebar ${state.sidebarOpen ? "closed" : "opened"}`);
      return { ...state, sidebarOpen: !state.sidebarOpen };

    case "OPEN_SIDEBAR":
      console.log("📱 Sidebar opened");
      return { ...state, sidebarOpen: true };

    case "CLOSE_SIDEBAR":
      console.log("📱 Sidebar closed");
      return { ...state, sidebarOpen: false };

    case "TOGGLE_MODAL":
      console.log(`🔲 Modal ${state.modalOpen ? "closed" : "opened"}`);
      return { ...state, modalOpen: !state.modalOpen };

    case "ADD_NOTIFICATION":
      const notification = {
        id: Math.random().toString(36).substr(2, 9),
        ...action.payload,
      };
      console.log(`🔔 Notification added: ${notification.message}`);
      return { ...state, notifications: [...state.notifications, notification] };

    case "REMOVE_NOTIFICATION":
      console.log(`🔕 Notification removed: ${action.payload}`);
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      };

    default:
      return state;
  }
}

const initialState = {
  theme: "light",
  sidebarOpen: false,
  modalOpen: false,
  notifications: [],
};

export function UIProvider({ children }) {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
      dispatch({ type: "SET_THEME", payload: savedTheme });
    }
  }, []);

  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem("theme", state.theme);

    // Apply theme to document
    if (state.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [state.theme]);

  const toggleTheme = () => dispatch({ type: "TOGGLE_THEME" });
  const setTheme = (theme) => dispatch({ type: "SET_THEME", payload: theme });
  const toggleSidebar = () => dispatch({ type: "TOGGLE_SIDEBAR" });
  const openSidebar = () => dispatch({ type: "OPEN_SIDEBAR" });
  const closeSidebar = () => dispatch({ type: "CLOSE_SIDEBAR" });
  const toggleModal = () => dispatch({ type: "TOGGLE_MODAL" });

  const addNotification = (message, type = "info") => {
    dispatch({ type: "ADD_NOTIFICATION", payload: { message, type } });
  };

  const removeNotification = (id) => {
    dispatch({ type: "REMOVE_NOTIFICATION", payload: id });
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      theme: state.theme,
      toggleTheme,
      setTheme,
      sidebarOpen: state.sidebarOpen,
      toggleSidebar,
      openSidebar,
      closeSidebar,
      modalOpen: state.modalOpen,
      toggleModal,
      addNotification,
      removeNotification,
      notifications: state.notifications,
    }),
    [state]
  );

  return <UIContext.Provider value={contextValue}>{children}</UIContext.Provider>;
}

/**
 * useUIContext Hook
 *
 * Access UI context in any component.
 * Must be used within a UIProvider.
 */
export function useUIContext() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUIContext must be used within a UIProvider");
  }
  return context;
}

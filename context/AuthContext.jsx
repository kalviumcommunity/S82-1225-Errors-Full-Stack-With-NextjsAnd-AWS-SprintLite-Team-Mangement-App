"use client";

import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import Cookies from "js-cookie";

/**
 * AuthContext
 *
 * Provides global authentication state management across the application.
 *
 * Features:
 * - User login/logout functionality
 * - Persistent authentication via cookies
 * - Auto-load user from cookies on mount
 *
 * Performance:
 * - Uses useMemo to prevent unnecessary re-renders
 * - Context value is memoized and only changes when user state changes
 * - Uses useCallback for login/logout to prevent unnecessary re-renders
 */

const AuthContext = createContext(undefined);

// Initialize user from cookies (called only once during initial render)
function getInitialUser() {
  if (typeof window === "undefined") return null;

  const token = Cookies.get("token");
  const savedUser = Cookies.get("user");

  if (token && savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      console.log("✅ User restored from cookies:", userData.name);
      return userData;
    } catch (error) {
      console.error("❌ Failed to parse saved user:", error);
      Cookies.remove("user");
      Cookies.remove("token");
    }
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback((username, email) => {
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: username,
      email: email,
    };

    setUser(newUser);

    // Persist to cookies
    Cookies.set("user", JSON.stringify(newUser), { expires: 7 });
    Cookies.set("token", "mock-jwt-token-" + newUser.id, { expires: 7 });

    console.log("✅ User logged in:", username);
    console.log("📧 Email:", email);
  }, []);

  const logout = useCallback(() => {
    const userName = user?.name;
    setUser(null);

    // Clear cookies
    Cookies.remove("user");
    Cookies.remove("token");

    console.log("👋 User logged out:", userName);
  }, [user]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isLoading,
    }),
    [user, isLoading, login, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

/**
 * useAuthContext Hook
 *
 * Access authentication context in any component.
 * Must be used within an AuthProvider.
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

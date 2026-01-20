import { useAuthContext } from "@/context/AuthContext";

/**
 * useAuth Hook
 *
 * Custom hook that provides authentication state and methods.
 * Simplifies access to auth context and adds computed values.
 *
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * if (isAuthenticated) {
 *   return <p>Welcome, {user.name}!</p>;
 * }
 */
export function useAuth() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuthContext();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    // Additional computed properties
    userName: user?.name || "Guest",
    userEmail: user?.email || "",
  };
}

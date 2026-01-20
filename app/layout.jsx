/**
 * Root Layout
 *
 * This is the main layout file that wraps all pages in the application.
 * It provides:
 * - Global context providers (Auth, UI)
 * - Reusable layout structure (Header + Sidebar + Main content)
 * - HTML metadata and global styles
 *
 * Context Hierarchy:
 * AuthProvider (outermost)
 *   └─ UIProvider
 *      └─ LayoutWrapper
 *         └─ Page Content
 */

import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>SprintLite - Task Management</title>
        <meta
          name="description"
          content="Modern task management platform with powerful routing, authentication, and team collaboration features"
        />
        <meta
          name="keywords"
          content="task management, Next.js, routing, authentication, team collaboration"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <AuthProvider>
          <UIProvider>
            {children}
            <Toaster
              position="top-right"
              reverseOrder={false}
              gutter={8}
              toastOptions={{
                // Default options
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#363636",
                  padding: "16px",
                  borderRadius: "8px",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                },
                // Success toast style
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#10b981",
                    secondary: "#fff",
                  },
                  style: {
                    border: "1px solid #10b981",
                  },
                  ariaProps: {
                    role: "status",
                    "aria-live": "polite",
                  },
                },
                // Error toast style
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                  style: {
                    border: "1px solid #ef4444",
                  },
                  ariaProps: {
                    role: "alert",
                    "aria-live": "assertive",
                  },
                },
                // Loading toast style
                loading: {
                  iconTheme: {
                    primary: "#3b82f6",
                    secondary: "#fff",
                  },
                  ariaProps: {
                    role: "status",
                    "aria-live": "polite",
                  },
                },
              }}
            />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

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
import { LayoutWrapper } from "@/components";
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
            <LayoutWrapper>{children}</LayoutWrapper>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

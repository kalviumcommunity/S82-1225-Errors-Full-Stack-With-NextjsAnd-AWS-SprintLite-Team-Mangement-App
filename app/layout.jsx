/**
 * Root Layout
 *
 * This is the main layout file that wraps all pages in the application.
 * It uses the reusable LayoutWrapper component to provide consistent
 * structure across all routes.
 *
 * The layout includes:
 * - HTML metadata (title, description, keywords)
 * - Global styles
 * - Reusable layout structure (Header + Sidebar + Main content)
 */

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
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}

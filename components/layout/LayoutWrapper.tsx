"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

/**
 * LayoutWrapper Component
 *
 * A flexible layout wrapper that provides:
 * - Consistent page structure (Header + Sidebar + Main content)
 * - Conditional sidebar rendering
 * - Responsive design
 * - Scroll management
 *
 * Props:
 * - children: React.ReactNode - The page content
 * - showSidebar?: boolean - Whether to show the sidebar (default: true)
 * - showHeader?: boolean - Whether to show the header (default: true)
 *
 * Accessibility:
 * - Semantic HTML structure
 * - Skip to main content link
 * - Proper landmark elements
 */

interface LayoutWrapperProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export default function LayoutWrapper({
  children,
  showSidebar = true,
  showHeader = true,
}: LayoutWrapperProps) {
  const pathname = usePathname();

  // Hide sidebar and header on login/auth pages
  const isAuthPage = pathname === "/login" || pathname.startsWith("/auth/");
  const shouldShowSidebar = showSidebar && !isAuthPage;
  const shouldShowHeader = showHeader && !isAuthPage;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {shouldShowHeader && <Header />}

      <div className="flex flex-1">
        {shouldShowSidebar && <Sidebar />}

        <main
          id="main-content"
          className={`flex-1 overflow-auto ${shouldShowSidebar ? "p-6" : "p-0"}`}
          role="main"
        >
          {children}
        </main>
      </div>

      {/* Footer (optional) */}
      {!isAuthPage && (
        <footer className="bg-white border-t border-gray-200 py-4 px-6" role="contentinfo">
          <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
            <p>© {new Date().getFullYear()} SprintLite. Built with Next.js App Router.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

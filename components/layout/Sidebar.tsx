"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Sidebar Component
 *
 * A reusable sidebar navigation component that provides:
 * - Secondary navigation links
 * - Active route highlighting
 * - Responsive design
 * - Collapsible sections (optional)
 *
 * Props:
 * - links?: Array of navigation items (optional, uses defaults)
 * - className?: Additional CSS classes
 *
 * Accessibility:
 * - Semantic <aside> element
 * - <nav> with aria-label
 * - Keyboard navigable
 * - Focus visible styles
 */

interface SidebarLink {
  href: string;
  label: string;
  icon?: string;
}

interface SidebarProps {
  links?: SidebarLink[];
  className?: string;
}

const defaultLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Overview", icon: "📊" },
  { href: "/users", label: "Users", icon: "👥" },
  { href: "/tasks-overview", label: "Tasks", icon: "✅" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ links = defaultLinks, className = "" }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <aside
      className={`w-64 bg-gray-50 border-r border-gray-200 min-h-screen ${className}`}
      aria-label="Sidebar navigation"
    >
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Navigation</h2>

        <nav aria-label="Secondary navigation">
          <ul className="space-y-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    isActive(link.href)
                      ? "bg-purple-100 text-purple-700 font-medium shadow-sm"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  aria-current={isActive(link.href) ? "page" : undefined}
                >
                  {link.icon && (
                    <span className="text-xl" role="img" aria-hidden="true">
                      {link.icon}
                    </span>
                  )}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Additional Sidebar Content */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="px-4 py-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-900 mb-1">Quick Tip</p>
            <p className="text-xs text-blue-700">Use keyboard shortcuts for faster navigation</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

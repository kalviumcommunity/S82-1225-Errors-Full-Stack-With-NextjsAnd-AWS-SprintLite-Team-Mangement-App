/**
 * Card Component
 *
 * A reusable card container component for displaying grouped content.
 *
 * Props Contract:
 * - title?: string - Optional card title
 * - children: React.ReactNode (required) - Card content
 * - footer?: React.ReactNode - Optional footer content
 * - variant?: "default" | "bordered" | "elevated" - Visual style
 * - padding?: "none" | "sm" | "md" | "lg" - Internal padding
 * - className?: string - Additional CSS classes
 * - onClick?: () => void - Makes card clickable
 *
 * Accessibility:
 * - Semantic <article> element
 * - Optional interactive state with keyboard support
 * - ARIA attributes when clickable
 * - Focus visible styles
 *
 * Usage:
 * <Card title="User Profile">
 *   <p>User details here</p>
 * </Card>
 */

interface CardProps {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "default" | "bordered" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export default function Card({
  title,
  children,
  footer,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
}: CardProps) {
  // Variant styles
  const variantStyles = {
    default: "bg-white border border-gray-200",
    bordered: "bg-white border-2 border-gray-300",
    elevated: "bg-white shadow-lg border border-gray-100",
  };

  // Padding styles
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  // Interactive styles
  const interactiveStyles = onClick
    ? "cursor-pointer hover:shadow-xl transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    : "";

  const Component = onClick ? "article" : "div";

  return (
    <Component
      className={`
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${interactiveStyles}
        rounded-lg
        ${className}
      `}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {title && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <div className="text-gray-700">{children}</div>

      {footer && <div className="mt-4 pt-4 border-t border-gray-200">{footer}</div>}
    </Component>
  );
}

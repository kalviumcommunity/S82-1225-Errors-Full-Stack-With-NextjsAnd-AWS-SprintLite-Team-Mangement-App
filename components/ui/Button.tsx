/**
 * Button Component
 *
 * A reusable button component with multiple variants and sizes.
 *
 * Props Contract:
 * - label: string (required) - The button text
 * - onClick?: () => void - Click handler function
 * - variant?: "primary" | "secondary" | "danger" | "success" - Visual style
 * - size?: "sm" | "md" | "lg" - Button size
 * - disabled?: boolean - Disabled state
 * - type?: "button" | "submit" | "reset" - HTML button type
 * - className?: string - Additional CSS classes
 * - ariaLabel?: string - Accessibility label (overrides label)
 *
 * Accessibility:
 * - Semantic <button> element
 * - ARIA labels when needed
 * - Keyboard accessible (Enter/Space)
 * - Focus visible styles
 * - Disabled state properly handled
 *
 * Usage:
 * <Button label="Click Me" variant="primary" />
 * <Button label="Delete" variant="danger" onClick={handleDelete} />
 */

interface ButtonProps {
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  ariaLabel?: string;
}

export default function Button({
  label,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button",
  className = "",
  ariaLabel,
}: ButtonProps) {
  // Variant styles
  const variantStyles = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Disabled styles
  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabledStyles}
        rounded-lg font-medium
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label={ariaLabel || label}
      aria-disabled={disabled}
    >
      {label}
    </button>
  );
}

/**
 * Input Component
 *
 * A reusable form input component with validation states.
 *
 * Props Contract:
 * - label?: string - Input label
 * - type?: string - HTML input type (default: "text")
 * - placeholder?: string - Placeholder text
 * - value: string (required) - Input value
 * - onChange: (value: string) => void (required) - Change handler
 * - error?: string - Error message to display
 * - disabled?: boolean - Disabled state
 * - required?: boolean - Required field indicator
 * - className?: string - Additional CSS classes
 * - id?: string - Input ID (auto-generated if not provided)
 *
 * Accessibility:
 * - Associated <label> with htmlFor
 * - ARIA attributes for errors
 * - Required field indicator
 * - Focus visible styles
 * - Keyboard accessible
 *
 * Usage:
 * <Input
 *   label="Email"
 *   type="email"
 *   value={email}
 *   onChange={setEmail}
 *   error={emailError}
 *   required
 * />
 */

import { useId } from "react";

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  className = "",
  id,
}: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-900">
          {label}
          {required && (
            <span className="text-red-600 ml-1" aria-label="required">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        className={`
          w-full px-4 py-2 
          border rounded-lg
          text-gray-900 placeholder-gray-400
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50
          ${error ? "border-red-500 focus:ring-red-500" : "border-gray-300 hover:border-gray-400"}
        `}
      />

      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

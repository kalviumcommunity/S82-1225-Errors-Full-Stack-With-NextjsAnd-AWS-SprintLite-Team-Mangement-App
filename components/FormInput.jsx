/**
 * Reusable Form Input Component
 *
 * A consistent, accessible input component with built-in error handling
 * and proper ARIA attributes for screen readers.
 *
 * Features:
 * - Automatic error display
 * - Accessibility support (labels, ARIA attributes)
 * - Customizable input types
 * - Consistent styling across forms
 */

export default function FormInput({
  label,
  name,
  type = "text",
  register,
  error,
  placeholder = "",
  ...rest
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-200">
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-4 py-2 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-700 focus:ring-blue-500 focus:border-blue-500 text-white"
        }`}
        {...rest}
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

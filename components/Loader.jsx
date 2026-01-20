/**
 * Accessible Loader Component
 *
 * Features:
 * - Animated spinner
 * - Screen reader announcements
 * - Multiple size variants
 * - Optional text label
 *
 * Props:
 * - size: 'sm' | 'md' | 'lg' - spinner size (default: 'md')
 * - text: string - optional loading text
 * - fullScreen: boolean - cover full screen (default: false)
 * - color: string - spinner color (default: 'blue')
 */
export default function Loader({
  size = "md",
  text = "Loading...",
  fullScreen = false,
  color = "blue",
}) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    blue: "border-blue-600 border-t-transparent",
    green: "border-green-600 border-t-transparent",
    red: "border-red-600 border-t-transparent",
    gray: "border-gray-600 border-t-transparent",
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-live="polite"
      aria-label={text}
    />
  );

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      {spinner}
      {text && (
        <p className="text-gray-400 text-sm font-medium" aria-live="polite">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

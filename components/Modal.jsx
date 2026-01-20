"use client";

import { useEffect, useRef } from "react";

/**
 * Accessible Modal Component
 *
 * Features:
 * - Focus trap inside modal
 * - ESC key to close
 * - Click outside to close
 * - Full ARIA attributes for accessibility
 * - Keyboard navigation support
 *
 * Props:
 * - isOpen: boolean - controls modal visibility
 * - onClose: function - callback when modal closes
 * - title: string - modal title (required for a11y)
 * - children: ReactNode - modal content
 * - showCloseButton: boolean - show X button (default: true)
 * - size: 'sm' | 'md' | 'lg' - modal size (default: 'md')
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  showCloseButton = true,
  size = "md",
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement;

      // Focus the dialog
      dialogRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore previous focus
      previousFocusRef.current?.focus();

      // Restore body scroll
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Handle focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleTab = (e) => {
      if (e.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={`relative ${sizeClasses[size]} w-full mx-4 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 transform transition-all`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 id="modal-title" className="text-xl font-semibold text-white">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

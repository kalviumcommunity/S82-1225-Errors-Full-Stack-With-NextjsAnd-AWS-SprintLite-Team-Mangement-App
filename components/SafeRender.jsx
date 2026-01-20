"use client";

/**
 * Client-Side Output Encoding and Safe Rendering
 *
 * React components and utilities for safe HTML rendering
 * Prevents XSS attacks when displaying user-generated content
 */

import React from "react";
import DOMPurify from "isomorphic-dompurify";

/**
 * ============================================================================
 * CLIENT-SIDE SANITIZATION
 * ============================================================================
 */

/**
 * Sanitize HTML for client-side rendering
 * Use with dangerouslySetInnerHTML only when necessary
 *
 * @param {string} html - HTML string to sanitize
 * @returns {string} - Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (typeof html !== "string") {
    return "";
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "span",
      "div",
    ],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):)/i,
  });
}

/**
 * ============================================================================
 * SAFE RENDERING COMPONENTS
 * ============================================================================
 */

/**
 * SafeHTML Component
 * Safely render user-generated HTML content
 *
 * @param {Object} props
 * @param {string} props.html - HTML content to render
 * @param {string} props.className - CSS classes
 * @param {string} props.as - HTML element type (default: 'div')
 *
 * @example
 * <SafeHTML html={userComment} className="comment-content" />
 */
export function SafeHTML({ html, className = "", as: Component = "div" }) {
  const sanitized = sanitizeHTML(html);

  return <Component className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

/**
 * SafeText Component
 * Render text with automatic escaping (React default behavior)
 * NO HTML tags allowed - pure text only
 *
 * @param {Object} props
 * @param {string} props.text - Text to display
 * @param {string} props.className - CSS classes
 * @param {string} props.as - HTML element type (default: 'span')
 *
 * @example
 * <SafeText text={userName} className="user-name" />
 */
export function SafeText({ text, className = "", as: Component = "span" }) {
  // React automatically escapes text content
  return <Component className={className}>{text || ""}</Component>;
}

/**
 * SafeLink Component
 * Render sanitized links with security attributes
 *
 * @param {Object} props
 * @param {string} props.href - Link URL
 * @param {string} props.children - Link text
 * @param {string} props.className - CSS classes
 * @param {boolean} props.external - Open in new tab (default: true)
 *
 * @example
 * <SafeLink href={userWebsite}>Visit Website</SafeLink>
 */
export function SafeLink({ href, children, className = "", external = true, ...props }) {
  // Validate URL
  if (!href || typeof href !== "string") {
    return <span className={className}>{children}</span>;
  }

  // Only allow http/https protocols
  const sanitizedHref = href.startsWith("http://") || href.startsWith("https://") ? href : "#";

  const linkProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer", // Prevent tabnabbing
      }
    : {};

  return (
    <a href={sanitizedHref} className={className} {...linkProps} {...props}>
      {children}
    </a>
  );
}

/**
 * CodeBlock Component
 * Safely display code snippets with syntax highlighting
 *
 * @param {Object} props
 * @param {string} props.code - Code to display
 * @param {string} props.language - Programming language
 * @param {string} props.className - CSS classes
 *
 * @example
 * <CodeBlock code={userCode} language="javascript" />
 */
export function CodeBlock({ code, language = "text", className = "" }) {
  // Escape HTML entities in code
  const escaped = code
    ? code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
    : "";

  return (
    <pre className={`code-block ${className}`}>
      <code className={`language-${language}`}>{escaped}</code>
    </pre>
  );
}

/**
 * ============================================================================
 * UTILITY HOOKS
 * ============================================================================
 */

/**
 * useSanitizedValue Hook
 * Sanitize and memoize a value for rendering
 *
 * @param {string} value - Value to sanitize
 * @param {string} type - Sanitization type ('html' or 'text')
 * @returns {string} - Sanitized value
 *
 * @example
 * const safeHTML = useSanitizedValue(userComment, 'html');
 */
export function useSanitizedValue(value, type = "text") {
  return React.useMemo(() => {
    if (type === "html") {
      return sanitizeHTML(value);
    }
    return value || "";
  }, [value, type]);
}

/**
 * ============================================================================
 * ATTACK PREVENTION EXAMPLES
 * ============================================================================
 */

/**
 * Example: Preventing XSS attacks
 *
 * ❌ UNSAFE:
 * <div dangerouslySetInnerHTML={{ __html: userComment }} />
 *
 * ✅ SAFE:
 * <SafeHTML html={userComment} />
 *
 * ❌ UNSAFE:
 * <a href={userUrl}>Link</a>
 * // User provides: javascript:alert('XSS')
 *
 * ✅ SAFE:
 * <SafeLink href={userUrl}>Link</SafeLink>
 * // Validates protocol, adds noopener/noreferrer
 *
 * ❌ UNSAFE:
 * <div>{userInput}</div>
 * // Actually safe in React, but use SafeText for clarity
 *
 * ✅ SAFE (explicit):
 * <SafeText text={userInput} />
 */

/**
 * ============================================================================
 * CONTENT SECURITY POLICY HELPERS
 * ============================================================================
 */

/**
 * Generate CSP nonce for inline scripts
 * Use in conjunction with Content-Security-Policy header
 *
 * @returns {string} - Random nonce
 */
export function generateNonce() {
  if (typeof window !== "undefined" && window.crypto) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2, 15);
}

/**
 * ============================================================================
 * XSS DETECTION UTILITIES
 * ============================================================================
 */

/**
 * Check if content contains potential XSS
 *
 * @param {string} content - Content to check
 * @returns {boolean} - True if suspicious patterns found
 */
export function containsXSS(content) {
  if (typeof content !== "string") return false;

  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>/gi,
    /onerror=/gi,
    /onload=/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(content));
}

/**
 * ============================================================================
 * SECURE FORM COMPONENTS
 * ============================================================================
 */

/**
 * SecureInput Component
 * Input field with XSS detection and sanitization
 *
 * @param {Object} props
 * @param {string} props.value - Input value
 * @param {function} props.onChange - Change handler
 * @param {string} props.type - Input type
 * @param {boolean} props.detectXSS - Show XSS warning
 *
 * @example
 * <SecureInput
 *   value={title}
 *   onChange={(e) => setTitle(e.target.value)}
 *   detectXSS={true}
 * />
 */
export function SecureInput({
  value,
  onChange,
  type = "text",
  detectXSS = false,
  className = "",
  ...props
}) {
  const [warning, setWarning] = React.useState("");

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (detectXSS && containsXSS(newValue)) {
      setWarning("⚠️ Suspicious content detected");
    } else {
      setWarning("");
    }

    onChange(e);
  };

  return (
    <div className="secure-input-wrapper">
      <input
        type={type}
        value={value}
        onChange={handleChange}
        className={`${className} ${warning ? "border-red-500" : ""}`}
        {...props}
      />
      {warning && (
        <div className="text-red-500 text-sm mt-1" role="alert">
          {warning}
        </div>
      )}
    </div>
  );
}

/**
 * SecureTextarea Component
 * Textarea with XSS detection and character limit
 *
 * @param {Object} props
 * @param {string} props.value - Textarea value
 * @param {function} props.onChange - Change handler
 * @param {number} props.maxLength - Maximum characters
 * @param {boolean} props.detectXSS - Show XSS warning
 *
 * @example
 * <SecureTextarea
 *   value={description}
 *   onChange={(e) => setDescription(e.target.value)}
 *   maxLength={5000}
 *   detectXSS={true}
 * />
 */
export function SecureTextarea({
  value,
  onChange,
  maxLength = 5000,
  detectXSS = false,
  className = "",
  ...props
}) {
  const [warning, setWarning] = React.useState("");
  const remaining = maxLength - (value?.length || 0);

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (detectXSS && containsXSS(newValue)) {
      setWarning("⚠️ Suspicious content detected");
    } else {
      setWarning("");
    }

    onChange(e);
  };

  return (
    <div className="secure-textarea-wrapper">
      <textarea
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        className={`${className} ${warning ? "border-red-500" : ""}`}
        {...props}
      />
      <div className="flex justify-between items-center mt-1 text-sm">
        {warning && (
          <div className="text-red-500" role="alert">
            {warning}
          </div>
        )}
        <div className={`ml-auto ${remaining < 100 ? "text-orange-500" : "text-gray-500"}`}>
          {remaining} characters remaining
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================================================
 * EXPORT ALL
 * ============================================================================
 */

export default {
  SafeHTML,
  SafeText,
  SafeLink,
  CodeBlock,
  SecureInput,
  SecureTextarea,
  sanitizeHTML,
  containsXSS,
  useSanitizedValue,
  generateNonce,
};

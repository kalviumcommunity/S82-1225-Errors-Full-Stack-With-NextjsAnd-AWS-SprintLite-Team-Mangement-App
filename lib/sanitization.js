/**
 * Input Sanitization and Validation Utilities
 *
 * OWASP-compliant security utilities to prevent:
 * - XSS (Cross-Site Scripting) attacks
 * - SQL Injection attacks
 * - HTML/Script injection
 * - Malicious input patterns
 *
 * Security Principles:
 * 1. Validate on input
 * 2. Sanitize on storage
 * 3. Encode on output
 * 4. Defense in depth
 */

import sanitizeHtml from "sanitize-html";
import validator from "validator";

/**
 * ============================================================================
 * INPUT SANITIZATION (Server-Side)
 * ============================================================================
 */

/**
 * Strict sanitization - removes ALL HTML tags and scripts
 * Use for: user names, titles, plain text fields
 *
 * @param {string} input - Raw user input
 * @returns {string} - Sanitized plain text
 *
 * @example
 * sanitizeInput('<script>alert("XSS")</script>Hello')
 * // Returns: 'Hello'
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") {
    return "";
  }

  // Remove ALL HTML tags and attributes
  return sanitizeHtml(input, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
    disallowedTagsMode: "discard", // Remove tags completely
  }).trim();
}

/**
 * Sanitize rich text content (allows safe HTML formatting)
 * Use for: comments, descriptions, rich text editors
 *
 * @param {string} input - Raw HTML input
 * @returns {string} - Sanitized HTML with allowed tags only
 *
 * @example
 * sanitizeRichText('<p>Hello</p><script>alert("XSS")</script>')
 * // Returns: '<p>Hello</p>'
 */
export function sanitizeRichText(input) {
  if (typeof input !== "string") {
    return "";
  }

  // Allow only safe formatting tags
  return sanitizeHtml(input, {
    allowedTags: [
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
    ],
    allowedAttributes: {
      a: ["href", "title", "target"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      a: ["http", "https", "mailto"],
    },
    // Transform tags
    transformTags: {
      // Force all links to open in new tab and add noopener
      a: (tagName, attribs) => ({
        tagName: "a",
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    },
  });
}

/**
 * Sanitize email addresses
 *
 * @param {string} email - Email input
 * @returns {string|null} - Normalized email or null if invalid
 */
export function sanitizeEmail(email) {
  if (typeof email !== "string") {
    return null;
  }

  const normalized = validator.normalizeEmail(email, {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false,
  });

  if (!normalized || !validator.isEmail(normalized)) {
    return null;
  }

  return normalized.toLowerCase();
}

/**
 * Sanitize URL
 *
 * @param {string} url - URL input
 * @returns {string|null} - Valid URL or null
 */
export function sanitizeUrl(url) {
  if (typeof url !== "string") {
    return null;
  }

  const trimmed = url.trim();

  // Validate URL format
  if (
    !validator.isURL(trimmed, {
      protocols: ["http", "https"],
      require_protocol: true,
    })
  ) {
    return null;
  }

  return trimmed;
}

/**
 * ============================================================================
 * VALIDATION FUNCTIONS
 * ============================================================================
 */

/**
 * Validate string length
 *
 * @param {string} input - String to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateLength(input, min = 1, max = 1000) {
  if (typeof input !== "string") {
    return { valid: false, error: "Input must be a string" };
  }

  const length = input.length;

  if (length < min) {
    return { valid: false, error: `Minimum length is ${min} characters` };
  }

  if (length > max) {
    return { valid: false, error: `Maximum length is ${max} characters` };
  }

  return { valid: true };
}

/**
 * Validate email format
 *
 * @param {string} email - Email to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateEmail(email) {
  if (typeof email !== "string") {
    return { valid: false, error: "Email must be a string" };
  }

  if (!validator.isEmail(email)) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

/**
 * Detect potential XSS patterns
 *
 * @param {string} input - Input to check
 * @returns {{ safe: boolean, threats: string[] }}
 */
export function detectXSS(input) {
  if (typeof input !== "string") {
    return { safe: true, threats: [] };
  }

  const threats = [];

  // Check for script tags
  if (/<script[^>]*>.*?<\/script>/gi.test(input)) {
    threats.push("Script tag detected");
  }

  // Check for event handlers
  if (/on\w+\s*=/gi.test(input)) {
    threats.push("Event handler detected (onclick, onerror, etc.)");
  }

  // Check for javascript: protocol
  if (/javascript:/gi.test(input)) {
    threats.push("JavaScript protocol detected");
  }

  // Check for data: protocol with script
  if (/data:text\/html[^,]*,/gi.test(input)) {
    threats.push("Data URI with HTML detected");
  }

  // Check for iframe tags
  if (/<iframe[^>]*>/gi.test(input)) {
    threats.push("iFrame tag detected");
  }

  // Check for object/embed tags
  if (/<(object|embed)[^>]*>/gi.test(input)) {
    threats.push("Object/Embed tag detected");
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

/**
 * Detect potential SQL Injection patterns
 *
 * @param {string} input - Input to check
 * @returns {{ safe: boolean, threats: string[] }}
 */
export function detectSQLi(input) {
  if (typeof input !== "string") {
    return { safe: true, threats: [] };
  }

  const threats = [];

  // Check for SQL keywords
  const sqlKeywords =
    /(\bOR\b|\bAND\b|\bUNION\b|\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bEXEC\b)/gi;
  if (sqlKeywords.test(input)) {
    threats.push("SQL keywords detected");
  }

  // Check for SQL comments
  if (/--|\*\/|\/\*/.test(input)) {
    threats.push("SQL comment syntax detected");
  }

  // Check for SQL injection patterns
  if (/('\s*(OR|AND)\s*'?\d)|('\s*=\s*')/.test(input)) {
    threats.push("SQL injection pattern detected");
  }

  // Check for semicolons (query termination)
  if (/;\s*(DROP|DELETE|UPDATE|INSERT)/.test(input)) {
    threats.push("Stacked query attempt detected");
  }

  return {
    safe: threats.length === 0,
    threats,
  };
}

/**
 * ============================================================================
 * SANITIZATION PIPELINE
 * ============================================================================
 */

/**
 * Comprehensive sanitization pipeline for user inputs
 *
 * @param {Object} data - Object with fields to sanitize
 * @param {Object} rules - Sanitization rules for each field
 * @returns {Object} - Sanitized data
 *
 * @example
 * const sanitized = sanitizeObject({
 *   name: '<script>alert("XSS")</script>John',
 *   email: 'JOHN@EXAMPLE.COM',
 *   bio: '<p>Hello</p><script>bad()</script>'
 * }, {
 *   name: 'plain',
 *   email: 'email',
 *   bio: 'rich'
 * });
 * // Returns: { name: 'John', email: 'john@example.com', bio: '<p>Hello</p>' }
 */
export function sanitizeObject(data, rules) {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    const rule = rules[key] || "plain";

    if (value === null || value === undefined) {
      sanitized[key] = value;
      continue;
    }

    switch (rule) {
      case "plain":
        sanitized[key] = sanitizeInput(String(value));
        break;

      case "rich":
        sanitized[key] = sanitizeRichText(String(value));
        break;

      case "email":
        sanitized[key] = sanitizeEmail(String(value));
        break;

      case "url":
        sanitized[key] = sanitizeUrl(String(value));
        break;

      case "none":
        // Skip sanitization (use with caution!)
        sanitized[key] = value;
        break;

      default:
        sanitized[key] = sanitizeInput(String(value));
    }
  }

  return sanitized;
}

/**
 * ============================================================================
 * MIDDLEWARE HELPERS
 * ============================================================================
 */

/**
 * Validate and sanitize request body
 *
 * @param {Object} body - Request body
 * @param {Object} schema - Validation and sanitization schema
 * @returns {{ valid: boolean, data?: Object, errors?: Object }}
 *
 * @example
 * const result = validateRequestBody(body, {
 *   title: { type: 'plain', required: true, minLength: 3, maxLength: 100 },
 *   description: { type: 'rich', required: false, maxLength: 5000 },
 *   email: { type: 'email', required: true }
 * });
 */
export function validateRequestBody(body, schema) {
  const errors = {};
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = body[field];

    // Check required fields
    if (rules.required && (value === undefined || value === null || value === "")) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip if not required and empty
    if (!rules.required && (value === undefined || value === null || value === "")) {
      sanitized[field] = null;
      continue;
    }

    // Validate length
    if (rules.minLength || rules.maxLength) {
      const validation = validateLength(
        String(value),
        rules.minLength || 0,
        rules.maxLength || Infinity
      );

      if (!validation.valid) {
        errors[field] = validation.error;
        continue;
      }
    }

    // Sanitize based on type
    switch (rules.type) {
      case "plain":
        sanitized[field] = sanitizeInput(String(value));
        break;

      case "rich":
        sanitized[field] = sanitizeRichText(String(value));
        break;

      case "email":
        const emailResult = sanitizeEmail(String(value));
        if (!emailResult) {
          errors[field] = "Invalid email format";
        } else {
          sanitized[field] = emailResult;
        }
        break;

      case "url":
        const urlResult = sanitizeUrl(String(value));
        if (!urlResult) {
          errors[field] = "Invalid URL format";
        } else {
          sanitized[field] = urlResult;
        }
        break;

      default:
        sanitized[field] = sanitizeInput(String(value));
    }

    // Check for XSS if configured
    if (rules.checkXSS && sanitized[field]) {
      const xssCheck = detectXSS(sanitized[field]);
      if (!xssCheck.safe) {
        errors[field] = `Security threat detected: ${xssCheck.threats.join(", ")}`;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    data: Object.keys(errors).length === 0 ? sanitized : undefined,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

/**
 * ============================================================================
 * LOGGING AND MONITORING
 * ============================================================================
 */

/**
 * Log security threats for monitoring
 *
 * @param {string} type - Threat type (XSS, SQLi, etc.)
 * @param {Object} details - Threat details
 */
export function logSecurityThreat(type, details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type,
    ...details,
  };

  console.error(`[SECURITY THREAT] ${type}:`, JSON.stringify(logEntry, null, 2));

  // In production, send to security monitoring service
  // await sendToSecurityMonitoring(logEntry);
}

/**
 * ============================================================================
 * EXAMPLE USAGE
 * ============================================================================
 */

// Example: Sanitize task creation
// const taskData = {
//   title: '<script>alert("XSS")</script>My Task',
//   description: '<p>Description</p><img src=x onerror="alert()">',
//   status: 'Todo'
// };
//
// const result = validateRequestBody(taskData, {
//   title: { type: 'plain', required: true, minLength: 3, maxLength: 100 },
//   description: { type: 'rich', required: false, maxLength: 5000 },
//   status: { type: 'plain', required: true }
// });
//
// if (!result.valid) {
//   return sendError('Validation failed', 400, ERROR_CODES.VALIDATION_ERROR, result.errors);
// }
//
// const sanitizedTask = await prisma.task.create({
//   data: result.data
// });

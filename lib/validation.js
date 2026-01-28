/**
 * Email validation utility
 * Returns true for valid email addresses, false otherwise
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Password validation utility
 * Returns true if password meets minimum requirements
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return false;
  }

  // Minimum 8 characters, at least one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Name validation utility
 * Returns true for non-empty strings
 */
export const validateName = (name) => {
  return typeof name === "string" && name.trim().length > 0;
};

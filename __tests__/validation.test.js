/**
 * Unit test for utility function: validateEmail
 * Tests basic email validation logic
 */
import { validateEmail } from "@/lib/validation";

describe("validateEmail utility", () => {
  test("returns true for valid email addresses", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.user@domain.co.uk")).toBe(true);
    expect(validateEmail("first+last@company.org")).toBe(true);
  });

  test("returns false for invalid email addresses", () => {
    expect(validateEmail("invalid.email")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("")).toBe(false);
  });

  test("returns false for null or undefined", () => {
    expect(validateEmail(null)).toBe(false);
    expect(validateEmail(undefined)).toBe(false);
  });
});

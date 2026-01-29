// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Use jsdom by default, but override for specific test suites
  testEnvironment: "jsdom",
  projects: [
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/__tests__/**/*.test.{js,jsx,ts,tsx}"],
    },
    {
      displayName: "smoke",
      testEnvironment: "node",
      testMatch: ["<rootDir>/__smoke_tests__/**/*.test.{js,jsx,ts,tsx}"],
    },
  ],
  collectCoverage: false,
  collectCoverageFrom: [
    "app/**/*.{js,jsx,ts,tsx}",
    "components/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "context/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
    "!**/coverage/**",
    "!**/*.config.{js,ts}",
    "!**/index.ts",
    "!**/vitest.shims.d.ts",
  ],
  // Coverage thresholds for tested modules only
  // Will be gradually increased as more tests are added
  coveragePathIgnorePatterns: ["/node_modules/", "/.next/", "/coverage/"],
  testMatch: ["**/__tests__/**/*.{js,jsx,ts,tsx}", "**/*.{spec,test}.{js,jsx,ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transformIgnorePatterns: ["/node_modules/", "^.+\\.module\\.(css|sass|scss)$"],
};

module.exports = createJestConfig(customJestConfig);

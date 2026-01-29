/* eslint-disable @typescript-eslint/no-require-imports */
// Polyfill fetch for Node.js test environment
if (typeof global.fetch === "undefined") {
  try {
    // node-fetch is available in Node 18+, but may need explicit import for jest
    const nodeFetch = require("node-fetch");
    global.fetch = nodeFetch.default || nodeFetch;
  } catch {
    // Node.js 18+ has built-in fetch, try to use it
    if (typeof globalThis.fetch === "undefined") {
      console.warn("fetch polyfill not available, some tests may fail");
    }
  }
}

// Import testing library utilities
try {
  require("@testing-library/jest-dom");
} catch {
  // Optional - skip if not needed for this test
}
/* eslint-enable @typescript-eslint/no-require-imports */

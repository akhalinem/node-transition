/**
 * Jest Test Setup
 * Runs before all tests
 */

// Load environment variables FIRST
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// Set test environment
process.env.NODE_ENV = "test";

// Suppress console.log during tests (optional)
if (process.env.SUPPRESS_LOGS === "true") {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  };
}

// Global test timeout
jest.setTimeout(10000);

/**
 * EXERCISE 1: Environment Configuration
 * Difficulty: ⭐⭐
 *
 * Build a robust configuration system using environment variables
 * with validation, type conversion, and helpful error messages.
 */

console.log("=== Exercise 1: Environment Configuration ===\n");

// ============================================
// CHALLENGE 1: Configuration Loader
// ============================================

console.log("Challenge 1: Build a Config Loader");
console.log("----------------------------------");

/**
 * Task: Create a ConfigLoader class that:
 * - Loads configuration from environment variables
 * - Validates required variables
 * - Provides type conversion (string, number, boolean, array)
 * - Gives clear error messages for missing/invalid config
 * - Supports default values
 *
 * Requirements:
 * - string(key, defaultValue)
 * - number(key, defaultValue)
 * - boolean(key, defaultValue)
 * - array(key, delimiter, defaultValue)
 * - required(key, type)
 * - validate() - throws if any errors
 */

class ConfigLoader {
  constructor() {
    this.config = {};
    this.errors = [];
  }

  string(key, defaultValue = null) {
    // TODO: Get string from process.env or use default
    // Store in this.config[key]
    throw new Error("Not implemented");
  }

  number(key, defaultValue = null) {
    // TODO: Get number from process.env, parse it
    // If NaN, add error
    // Store in this.config[key]
    throw new Error("Not implemented");
  }

  boolean(key, defaultValue = false) {
    // TODO: Get boolean from process.env
    // Accept: 'true', 'false', '1', '0', 'yes', 'no'
    // Store in this.config[key]
    throw new Error("Not implemented");
  }

  array(key, delimiter = ",", defaultValue = []) {
    // TODO: Get array from process.env
    // Split by delimiter, trim each value
    // Store in this.config[key]
    throw new Error("Not implemented");
  }

  required(key, type = "string") {
    // TODO: Mark a variable as required
    // If not present, add to errors
    // Use the appropriate type method above
    throw new Error("Not implemented");
  }

  validate() {
    // TODO: Check if any errors, throw if so
    throw new Error("Not implemented");
  }

  getConfig() {
    return this.config;
  }
}

// Test your implementation
async function testChallenge1() {
  // Set some test environment variables
  process.env.TEST_PORT = "3000";
  process.env.TEST_DEBUG = "true";
  process.env.TEST_WORKERS = "4";
  process.env.TEST_ALLOWED_HOSTS = "localhost,127.0.0.1,example.com";

  try {
    const loader = new ConfigLoader();

    // Load configuration
    loader.number("PORT", 8080);
    loader.boolean("DEBUG", false);
    loader.number("WORKERS", 1);
    loader.array("ALLOWED_HOSTS", ",", ["localhost"]);
    // loader.required('API_KEY'); // This should fail!

    loader.validate();

    const config = loader.getConfig();
    console.log("\n✓ Configuration loaded:");
    console.log(JSON.stringify(config, null, 2));
    console.log("\n  Port type:", typeof config.PORT);
    console.log("  Debug type:", typeof config.DEBUG);
    console.log("  Allowed hosts type:", Array.isArray(config.ALLOWED_HOSTS));
  } catch (error) {
    console.log("✗ Test failed:", error.message);
  }
}

// Uncomment to test:
// testChallenge1().then(() => console.log('\n'));

// ============================================
// CHALLENGE 2: Multi-Environment Config
// ============================================

setTimeout(() => {
  console.log("\nChallenge 2: Multi-Environment Configuration");
  console.log("--------------------------------------------");

  /**
   * Task: Create a configuration system that:
   * - Loads different configs based on NODE_ENV
   * - Merges base config with environment-specific config
   * - Allows environment variables to override config files
   * - Validates the final configuration
   *
   * Config structure:
   * - base.config.js - Default config for all environments
   * - development.config.js - Dev-specific overrides
   * - production.config.js - Prod-specific overrides
   * - Environment variables override everything
   */

  class AppConfig {
    constructor(env = process.env.NODE_ENV || "development") {
      this.env = env;
      this.config = {};
    }

    loadBaseConfig() {
      // TODO: Define base configuration
      // Return an object with default values
      throw new Error("Not implemented");
    }

    loadEnvConfig() {
      // TODO: Load environment-specific configuration
      // Based on this.env
      throw new Error("Not implemented");
    }

    applyEnvOverrides(config) {
      // TODO: Apply environment variable overrides
      // Example: DATABASE_URL env var overrides config.database.url
      // Use naming convention: SECTION_KEY
      throw new Error("Not implemented");
    }

    validate(config) {
      // TODO: Validate the final configuration
      // Check required fields, valid values, etc.
      throw new Error("Not implemented");
    }

    load() {
      // TODO: Combine all configs in order:
      // 1. Base config
      // 2. Environment-specific config
      // 3. Environment variable overrides
      // 4. Validate
      // Return final config
      throw new Error("Not implemented");
    }
  }

  // Test your implementation
  async function testChallenge2() {
    try {
      const appConfig = new AppConfig("development");
      const config = appConfig.load();

      console.log("\n✓ Configuration:");
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge2().then(() => console.log('\n'));
}, 100);

// ============================================
// CHALLENGE 3: Secret Management
// ============================================

setTimeout(() => {
  console.log("\nChallenge 3: Secret Masking");
  console.log("---------------------------");

  /**
   * Task: Create a SecretManager that:
   * - Loads secrets from environment variables
   * - Masks secrets when logging
   * - Validates secret format (e.g., API keys)
   * - Provides safe toString() for objects with secrets
   */

  class SecretManager {
    constructor() {
      this.secrets = new Map();
    }

    addSecret(key, envVarName, validator = null) {
      // TODO: Load secret from environment variable
      // Validate with validator function if provided
      // Store in this.secrets Map
      throw new Error("Not implemented");
    }

    get(key) {
      // TODO: Get the actual secret value
      // Throw error if not found
      throw new Error("Not implemented");
    }

    mask(value, visibleChars = 4) {
      // TODO: Mask a secret value
      // Show first `visibleChars` characters, rest as asterisks
      // Example: "sk_live_1234567890" -> "sk_l***"
      throw new Error("Not implemented");
    }

    toString() {
      // TODO: Return safe string representation
      // Show masked versions of all secrets
      throw new Error("Not implemented");
    }

    validate() {
      // TODO: Validate all secrets exist and are valid
      throw new Error("Not implemented");
    }
  }

  // Validator examples
  function isValidAPIKey(key) {
    return /^sk_[a-z]+_[a-zA-Z0-9]+$/.test(key);
  }

  function isValidJWT(token) {
    return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(token);
  }

  // Test your implementation
  async function testChallenge3() {
    process.env.API_KEY = "sk_test_abc123xyz789";
    process.env.DB_PASSWORD = "super_secret_password_123";

    try {
      const secrets = new SecretManager();

      secrets.addSecret("apiKey", "API_KEY", isValidAPIKey);
      secrets.addSecret("dbPassword", "DB_PASSWORD");

      secrets.validate();

      console.log("\n✓ Secrets loaded");
      console.log("  Secrets:", secrets.toString());
      console.log("  API Key (actual):", secrets.get("apiKey"));
      console.log("  API Key (masked):", secrets.mask(secrets.get("apiKey")));
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge3().then(() => console.log('\n'));
}, 200);

// ============================================
// CHALLENGE 4: Feature Flags
// ============================================

setTimeout(() => {
  console.log("\nChallenge 4: Feature Flag System");
  console.log("--------------------------------");

  /**
   * Task: Create a FeatureFlags system that:
   * - Loads feature flags from environment variables
   * - Supports boolean flags
   * - Supports percentage rollouts (0-100)
   * - Supports user-based flags
   * - Has helper methods to check if feature is enabled
   */

  class FeatureFlags {
    constructor() {
      this.flags = new Map();
    }

    define(name, envVar, defaultValue = false) {
      // TODO: Define a boolean feature flag
      // Load from environment variable
      throw new Error("Not implemented");
    }

    defineRollout(name, envVar, defaultPercentage = 0) {
      // TODO: Define a percentage rollout flag
      // Load percentage from environment variable (0-100)
      throw new Error("Not implemented");
    }

    isEnabled(name, userId = null) {
      // TODO: Check if feature is enabled
      // For boolean flags: return true/false
      // For rollout flags: use userId to determine if enabled
      //   Hash userId and check if hash % 100 < percentage
      throw new Error("Not implemented");
    }

    getAllFlags() {
      // TODO: Return all flags with their status
      throw new Error("Not implemented");
    }
  }

  // Test your implementation
  async function testChallenge4() {
    process.env.FEATURE_NEW_UI = "true";
    process.env.FEATURE_BETA_API = "false";
    process.env.FEATURE_NEW_ALGO_ROLLOUT = "25"; // 25% of users

    try {
      const flags = new FeatureFlags();

      flags.define("newUI", "FEATURE_NEW_UI", false);
      flags.define("betaAPI", "FEATURE_BETA_API", false);
      flags.defineRollout("newAlgorithm", "FEATURE_NEW_ALGO_ROLLOUT", 0);

      console.log("\n✓ Feature Flags:");
      console.log("  New UI:", flags.isEnabled("newUI"));
      console.log("  Beta API:", flags.isEnabled("betaAPI"));
      console.log(
        "  New Algorithm (user 1):",
        flags.isEnabled("newAlgorithm", "user1")
      );
      console.log(
        "  New Algorithm (user 2):",
        flags.isEnabled("newAlgorithm", "user2")
      );
      console.log(
        "  New Algorithm (user 100):",
        flags.isEnabled("newAlgorithm", "user100")
      );

      console.log("\n  All flags:", flags.getAllFlags());
    } catch (error) {
      console.log("✗ Test failed:", error.message);
    }
  }

  // Uncomment to test:
  // testChallenge4().then(() => console.log('\n'));
}, 300);

// ============================================
// GETTING STARTED
// ============================================

setTimeout(() => {
  console.log("\n=== Getting Started ===");
  console.log("1. Implement each Challenge class");
  console.log("2. Uncomment the test functions");
  console.log("3. Run: node exercise-1-environment.js");
  console.log("4. Test with different environment variables:");
  console.log(
    "   NODE_ENV=production PORT=8080 node exercise-1-environment.js"
  );
  console.log("\n=== Solution ===");
  console.log("Compare your solution with: exercise-1-solution.js");
}, 400);

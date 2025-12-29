/**
 * 02 - Environment Variables
 *
 * Learn how to use environment variables for configuration,
 * secrets, and environment-specific settings. This is CRITICAL
 * for production applications!
 */

console.log("=== Environment Variables ===\n");

// ============================================
// 1. Reading Environment Variables
// ============================================

console.log("1. Reading Environment Variables:");

// Access environment variables via process.env
console.log("  NODE_ENV:", process.env.NODE_ENV || "(not set)");
console.log("  HOME:", process.env.HOME);
console.log("  USER:", process.env.USER || process.env.USERNAME);
console.log("  PATH (first 100 chars):", process.env.PATH?.substring(0, 100));

console.log();

// ============================================
// 2. Setting Environment Variables
// ============================================

console.log("2. Setting Environment Variables:");

// Set a custom environment variable
process.env.MY_CUSTOM_VAR = "Hello from Node.js!";
console.log("  Set MY_CUSTOM_VAR:", process.env.MY_CUSTOM_VAR);

// Note: This only affects the current process and its children
console.log("  ℹ️  This variable only exists in this process");

console.log();

// ============================================
// 3. Common Patterns for Configuration
// ============================================

console.log("3. Configuration Patterns:");

// Pattern 1: Default values with fallback
const port = process.env.PORT || 3000;
const nodeEnv = process.env.NODE_ENV || "development";

console.log("  Port:", port);
console.log("  Environment:", nodeEnv);

// Pattern 2: Required variables (fail fast if missing)
function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

try {
  // This will throw because REQUIRED_VAR doesn't exist
  // const apiKey = requireEnv('API_KEY');
  console.log("  ✓ Use requireEnv() for critical config");
} catch (error) {
  console.log("  (Would throw if uncommented)");
}

// Pattern 3: Type conversion
const maxConnections = parseInt(process.env.MAX_CONNECTIONS || "100", 10);
const enableCache = process.env.ENABLE_CACHE === "true";
const timeout = parseFloat(process.env.TIMEOUT || "30.5");

console.log("  Max connections:", maxConnections, typeof maxConnections);
console.log("  Cache enabled:", enableCache, typeof enableCache);
console.log("  Timeout:", timeout, typeof timeout);

console.log();

// ============================================
// 4. Environment-Specific Configuration
// ============================================

console.log("4. Environment-Specific Config:");

const config = {
  development: {
    database: "localhost:5432",
    logLevel: "debug",
    enableCaching: false,
  },
  production: {
    database: process.env.DATABASE_URL || "prod-db:5432",
    logLevel: "error",
    enableCaching: true,
  },
  test: {
    database: "localhost:5433",
    logLevel: "silent",
    enableCaching: false,
  },
};

const currentEnv = process.env.NODE_ENV || "development";
const appConfig = config[currentEnv];

console.log("  Current environment:", currentEnv);
console.log("  Config:", appConfig);

console.log();

// ============================================
// 5. Secrets Management
// ============================================

console.log("5. Handling Secrets:");

// ❌ NEVER hardcode secrets
const badPractice = "sk_live_1234567890abcdef"; // DON'T DO THIS!

// ✅ Always use environment variables
const apiKey = process.env.API_KEY || "not-set";
const dbPassword = process.env.DB_PASSWORD || "not-set";

console.log(
  "  API Key:",
  apiKey === "not-set" ? "(not configured)" : "***hidden***"
);
console.log(
  "  DB Password:",
  dbPassword === "not-set" ? "(not configured)" : "***hidden***"
);

console.log("\n  Best Practices:");
console.log("    • Use .env files for local development");
console.log("    • Never commit .env to version control");
console.log("    • Use secret managers in production (AWS Secrets, Vault)");
console.log("    • Validate secrets at startup");

console.log();

// ============================================
// 6. .env File Pattern (with dotenv package)
// ============================================

console.log("6. Using .env Files:");

console.log("  Example .env file:");
console.log(`
    NODE_ENV=development
    PORT=3000
    DATABASE_URL=postgresql://localhost:5432/mydb
    API_KEY=sk_test_1234567890
    ENABLE_DEBUG=true
  `);

console.log("  Load with dotenv package:");
console.log(`
    // At the top of your entry file
    require('dotenv').config();
    
    // Now use process.env normally
    const port = process.env.PORT;
  `);

console.log("  ⚠️  Remember to add .env to .gitignore!");

console.log();

// ============================================
// 7. Feature Flags
// ============================================

console.log("7. Feature Flags:");

// Use environment variables for feature toggles
const features = {
  newUI: process.env.FEATURE_NEW_UI === "true",
  betaAPI: process.env.FEATURE_BETA_API === "true",
  analytics: process.env.FEATURE_ANALYTICS !== "false", // Enabled by default
};

console.log("  Features:", features);

function renderUI() {
  if (features.newUI) {
    return "Rendering new UI...";
  }
  return "Rendering old UI...";
}

console.log("  UI:", renderUI());

console.log();

// ============================================
// 8. Validation Helper
// ============================================

console.log("8. Configuration Validation:");

class ConfigValidator {
  constructor() {
    this.errors = [];
  }

  require(name, type = "string") {
    const value = process.env[name];

    if (!value) {
      this.errors.push(`Missing required variable: ${name}`);
      return null;
    }

    if (type === "number") {
      const num = Number(value);
      if (isNaN(num)) {
        this.errors.push(`${name} must be a number, got: ${value}`);
        return null;
      }
      return num;
    }

    if (type === "boolean") {
      if (value !== "true" && value !== "false") {
        this.errors.push(`${name} must be "true" or "false", got: ${value}`);
        return null;
      }
      return value === "true";
    }

    return value;
  }

  optional(name, defaultValue, type = "string") {
    const value = process.env[name];

    if (!value) {
      return defaultValue;
    }

    if (type === "number") {
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    }

    if (type === "boolean") {
      return value === "true";
    }

    return value;
  }

  validate() {
    if (this.errors.length > 0) {
      throw new Error(
        "Configuration validation failed:\n  " + this.errors.join("\n  ")
      );
    }
  }
}

// Example usage
const validator = new ConfigValidator();

const validatedConfig = {
  port: validator.optional("PORT", 3000, "number"),
  host: validator.optional("HOST", "localhost"),
  nodeEnv: validator.optional("NODE_ENV", "development"),
  // apiKey: validator.require('API_KEY'), // Would fail if not set
};

try {
  validator.validate();
  console.log("  ✓ Configuration valid:", validatedConfig);
} catch (error) {
  console.log("  ✗ Validation failed:", error.message);
}

console.log();

// ============================================
// 9. Environment Variable Naming Conventions
// ============================================

console.log("9. Naming Conventions:");

console.log("  Good names:");
console.log("    • DATABASE_URL          (clear, specific)");
console.log("    • REDIS_PORT            (prefixed with service)");
console.log("    • JWT_SECRET            (describes purpose)");
console.log("    • MAX_UPLOAD_SIZE       (clear limit)");
console.log("    • FEATURE_NEW_CHECKOUT  (clear feature flag)");

console.log("\n  Avoid:");
console.log("    • secret                (too generic)");
console.log("    • var1, var2            (meaningless)");
console.log("    • myApiKey              (use SNAKE_CASE)");

console.log();

// ============================================
// 10. Runtime Environment Detection
// ============================================

console.log("10. Detecting Runtime Environment:");

function detectEnvironment() {
  // Check for common cloud providers
  const isAWS = !!process.env.AWS_EXECUTION_ENV;
  const isHeroku = !!process.env.DYNO;
  const isGCP = !!process.env.GOOGLE_CLOUD_PROJECT;
  const isDocker = require("fs").existsSync("/.dockerenv");

  return {
    isProduction: process.env.NODE_ENV === "production",
    isDevelopment: process.env.NODE_ENV === "development",
    isTest: process.env.NODE_ENV === "test",
    isAWS,
    isHeroku,
    isGCP,
    isDocker,
  };
}

const runtime = detectEnvironment();
console.log("  Runtime:", runtime);

console.log("\n=== Key Takeaways ===");
console.log("✓ Use process.env to access environment variables");
console.log("✓ Always provide defaults: process.env.PORT || 3000");
console.log("✓ Never hardcode secrets - use environment variables");
console.log("✓ Use .env files for local development (with dotenv)");
console.log("✓ Validate required variables at startup");
console.log("✓ Use NODE_ENV to switch between environments");
console.log("✓ Feature flags can be controlled via env vars");
console.log("✓ Remember: all env vars are strings - convert as needed!");

console.log("\n=== Try It ===");
console.log("Run with custom variables:");
console.log("  NODE_ENV=production PORT=8080 node 02-environment-variables.js");

/**
 * Input Validation Utilities
 * Validates and sanitizes user inputs
 */

/**
 * Validate URL format and security
 * @param {string} url - URL to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateUrl(url) {
  // Check if URL exists
  if (!url || typeof url !== "string") {
    return { valid: false, error: "URL is required and must be a string" };
  }

  // Trim whitespace
  url = url.trim();

  // Check length (prevent abuse)
  if (url.length > 2048) {
    return {
      valid: false,
      error: "URL exceeds maximum length of 2048 characters",
    };
  }

  if (url.length < 10) {
    return { valid: false, error: "URL is too short" };
  }

  // Check protocol (must be http or https)
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { valid: false, error: "URL must start with http:// or https://" };
  }

  // Use URL constructor for validation
  try {
    const parsedUrl = new URL(url);

    // Prevent localhost/private IPs (security)
    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1"
    ) {
      return { valid: false, error: "Cannot shorten localhost URLs" };
    }

    // Block private IP ranges (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
    const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipMatch = hostname.match(ipv4Pattern);

    if (ipMatch) {
      const [, a, b] = ipMatch.map(Number);
      if (
        a === 10 ||
        (a === 192 && b === 168) ||
        (a === 172 && b >= 16 && b <= 31)
      ) {
        return { valid: false, error: "Cannot shorten private IP addresses" };
      }
    }

    // Block file:// and other dangerous protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return {
        valid: false,
        error: "Only HTTP and HTTPS protocols are allowed",
      };
    }

    return { valid: true, url: url.trim() };
  } catch (err) {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Validate custom alias
 * @param {string} alias - Custom alias to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateCustomAlias(alias) {
  // Optional field
  if (!alias) {
    return { valid: true };
  }

  if (typeof alias !== "string") {
    return { valid: false, error: "Custom alias must be a string" };
  }

  // Trim whitespace
  alias = alias.trim();

  // Check length
  if (alias.length < 3) {
    return {
      valid: false,
      error: "Custom alias must be at least 3 characters",
    };
  }

  if (alias.length > 10) {
    return { valid: false, error: "Custom alias cannot exceed 10 characters" };
  }

  // Only alphanumeric characters (no special chars for clean URLs)
  const aliasPattern = /^[a-zA-Z0-9]+$/;
  if (!aliasPattern.test(alias)) {
    return {
      valid: false,
      error: "Custom alias can only contain letters and numbers",
    };
  }

  // Prevent reserved words
  const reservedWords = [
    "api",
    "admin",
    "health",
    "stats",
    "analytics",
    "dashboard",
  ];
  if (reservedWords.includes(alias.toLowerCase())) {
    return { valid: false, error: "This alias is reserved and cannot be used" };
  }

  return { valid: true, alias: alias.trim() };
}

/**
 * Validate short code format (for lookups)
 * @param {string} shortCode - Short code to validate
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateShortCode(shortCode) {
  if (!shortCode || typeof shortCode !== "string") {
    return { valid: false, error: "Short code is required" };
  }

  // Trim whitespace
  shortCode = shortCode.trim();

  // Check length (Base62 codes are typically 6-8 chars)
  if (shortCode.length < 3 || shortCode.length > 10) {
    return { valid: false, error: "Invalid short code format" };
  }

  // Only alphanumeric characters
  const codePattern = /^[a-zA-Z0-9]+$/;
  if (!codePattern.test(shortCode)) {
    return { valid: false, error: "Short code contains invalid characters" };
  }

  return { valid: true, shortCode: shortCode.trim() };
}

/**
 * Sanitize string input (prevent XSS)
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .trim()
    .replace(/[<>\"']/g, "") // Remove potential XSS characters
    .substring(0, 1000); // Limit length
}

/**
 * Validate request body size
 * @param {Object} body - Request body
 * @returns {Object} { valid: boolean, error?: string }
 */
function validateRequestSize(body) {
  const jsonString = JSON.stringify(body);
  const sizeInBytes = Buffer.byteLength(jsonString, "utf8");
  const maxSize = 10 * 1024; // 10KB

  if (sizeInBytes > maxSize) {
    return { valid: false, error: "Request body too large (max 10KB)" };
  }

  return { valid: true };
}

module.exports = {
  validateUrl,
  validateCustomAlias,
  validateShortCode,
  sanitizeString,
  validateRequestSize,
};

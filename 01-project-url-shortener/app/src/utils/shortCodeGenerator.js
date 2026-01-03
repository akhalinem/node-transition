/**
 * Short Code Generator
 * Uses Base62 encoding (0-9, a-z, A-Z)
 */

const BASE62_CHARS =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

/**
 * Generate a random short code
 * @param {number} length - Length of the short code (default: 6)
 * @returns {string} Random short code
 */
function generateRandomCode(length = 6) {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE62_CHARS.length);
    result += BASE62_CHARS[randomIndex];
  }
  return result;
}

/**
 * Validate short code format
 * @param {string} code - Short code to validate
 * @returns {boolean} True if valid
 */
function isValidShortCode(code) {
  if (!code || typeof code !== "string") {
    return false;
  }

  // Check length (3-10 characters, matching database schema)
  if (code.length < 3 || code.length > 10) {
    return false;
  }

  // Only allow Base62 characters (alphanumeric only, no special chars)
  const validCharsRegex = /^[0-9a-zA-Z]+$/;
  return validCharsRegex.test(code);
}

module.exports = {
  generateRandomCode,
  isValidShortCode,
};

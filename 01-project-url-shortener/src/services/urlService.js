const { query } = require("../config/database");
const {
  generateRandomCode,
  isValidShortCode,
} = require("../utils/shortCodeGenerator");
const { isValidUrl, normalizeUrl } = require("../utils/urlValidator");

/**
 * URL Service
 * Handles all business logic for URL shortening
 */

class UrlService {
  /**
   * Create a shortened URL
   * @param {string} originalUrl - The URL to shorten
   * @param {string} customAlias - Optional custom short code
   * @param {string} expiresAt - Optional expiration date ISO string
   * @returns {Object} Created URL object
   */
  async createShortUrl(originalUrl, customAlias = null, expiresAt = null) {
    // Normalize and validate URL
    const normalizedUrl = normalizeUrl(originalUrl);

    if (!isValidUrl(normalizedUrl)) {
      throw new Error("Invalid URL format");
    }

    let shortCode;

    // If custom alias provided
    if (customAlias) {
      if (!isValidShortCode(customAlias)) {
        throw new Error("Invalid custom alias format");
      }

      // Check if alias already exists
      const existing = await this.getByShortCode(customAlias);
      if (existing) {
        throw new Error("Custom alias already in use");
      }

      shortCode = customAlias;
    } else {
      // Generate random short code
      shortCode = await this.generateUniqueShortCode();
    }

    // Insert into database
    const result = await query(
      `INSERT INTO urls (short_code, original_url, custom_alias, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [shortCode, normalizedUrl, customAlias !== null, expiresAt]
    );

    return result.rows[0];
  }

  /**
   * Generate a unique short code (handles collisions)
   * @returns {string} Unique short code
   */
  async generateUniqueShortCode(maxAttempts = 5) {
    for (let i = 0; i < maxAttempts; i++) {
      const code = generateRandomCode(6);
      const existing = await this.getByShortCode(code);

      if (!existing) {
        return code;
      }
    }

    throw new Error("Failed to generate unique short code");
  }

  /**
   * Get URL by short code
   * @param {string} shortCode - Short code to look up
   * @returns {Object|null} URL object or null
   */
  async getByShortCode(shortCode) {
    const result = await query("SELECT * FROM urls WHERE short_code = $1", [
      shortCode,
    ]);

    return result.rows[0] || null;
  }

  /**
   * Increment click count and update last accessed time
   * @param {string} shortCode - Short code to update
   */
  async incrementClickCount(shortCode) {
    await query(
      `UPDATE urls 
       SET click_count = click_count + 1,
           last_accessed = CURRENT_TIMESTAMP
       WHERE short_code = $1`,
      [shortCode]
    );
  }

  /**
   * Check if URL is expired
   * @param {Object} urlObject - URL object from database
   * @returns {boolean} True if expired
   */
  isExpired(urlObject) {
    if (!urlObject.expires_at) {
      return false;
    }

    return new Date(urlObject.expires_at) < new Date();
  }
}

module.exports = new UrlService();

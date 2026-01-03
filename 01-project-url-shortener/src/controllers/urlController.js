const urlService = require("../services/urlService");
const analyticsService = require("../services/analyticsService");
const cacheService = require("../services/cacheService");
const {
  isValidExpiresAt,
  isValidExpiresIn,
} = require("../utils/expirationValidator");
const {
  validateUrl,
  validateCustomAlias,
  validateShortCode,
  validateRequestSize,
} = require("../utils/inputValidator");

/**
 * URL Controller
 * Handles HTTP requests for URL operations
 */

class UrlController {
  /**
   * POST /api/shorten
   * Create a shortened URL
   */
  async shortenUrl(req, res) {
    try {
      const { url, customAlias, expiresAt, expiresIn } = req.body;

      // Validate request size
      const sizeValidation = validateRequestSize(req.body);
      if (!sizeValidation.valid) {
        return res.status(413).json({
          success: false,
          error: sizeValidation.error,
        });
      }

      // Validate URL
      const urlValidation = validateUrl(url);
      if (!urlValidation.valid) {
        return res.status(400).json({
          success: false,
          error: urlValidation.error,
        });
      }

      // Validate custom alias (if provided)
      const aliasValidation = validateCustomAlias(customAlias);
      if (!aliasValidation.valid) {
        return res.status(400).json({
          success: false,
          error: aliasValidation.error,
        });
      }

      // Validate expiration (if provided)
      if (expiresAt && !isValidExpiresAt(expiresAt)) {
        return res.status(400).json({
          success: false,
          error: "Invalid expiration date format",
        });
      }

      if (expiresIn && !isValidExpiresIn(expiresIn)) {
        return res.status(400).json({
          success: false,
          error: "Invalid expiration duration",
        });
      }

      let expiration = null;
      if (expiresIn) {
        expiration = new Date(Date.now() + expiresIn * 1000).toISOString();
      } else if (expiresAt) {
        expiration = new Date(expiresAt).toISOString();
      }

      // Create short URL (use validated/sanitized values)
      const result = await urlService.createShortUrl(
        urlValidation.url,
        aliasValidation.alias || null,
        expiration
      );

      await cacheService.set(result.short_code, result);

      // Build response
      const baseUrl = process.env.BASE_URL || "http://localhost:3000";
      const shortUrl = `${baseUrl}/${result.short_code}`;

      return res.status(201).json({
        success: true,
        data: {
          shortUrl,
          shortCode: result.short_code,
          originalUrl: result.original_url,
          createdAt: result.created_at,
          expiresAt: result.expires_at,
        },
      });
    } catch (err) {
      console.error("Error shortening URL:", err);

      return res.status(400).json({
        success: false,
        error: err.message,
      });
    }
  }

  /**
   * GET /:shortCode
   * Redirect to original URL
   */
  async redirectUrl(req, res) {
    try {
      const { shortCode } = req.params;

      // Validate short code format
      const codeValidation = validateShortCode(shortCode);
      if (!codeValidation.valid) {
        return res.status(400).json({
          success: false,
          error: codeValidation.error,
        });
      }

      // Get URL from cache (or database if cache miss)
      const urlObject = await cacheService.getUrl(codeValidation.shortCode);

      if (!urlObject) {
        return res.status(404).json({
          success: false,
          error: "Short URL not found",
        });
      }

      // Check if expired
      if (urlService.isExpired(urlObject)) {
        return res.status(410).json({
          success: false,
          error: "This short URL has expired",
        });
      }

      // Track click in Redis (super fast, non-blocking)
      analyticsService.trackClick(codeValidation.shortCode).catch((err) => {
        console.error("Error tracking click:", err);
      });

      // Redirect
      return res.redirect(301, urlObject.original_url);
    } catch (err) {
      console.error("Error redirecting:", err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }

  /**
   * GET /api/stats/:shortCode
   * Get analytics for a short URL
   */
  async getStats(req, res) {
    try {
      const { shortCode } = req.params;

      // Validate short code format
      const codeValidation = validateShortCode(shortCode);
      if (!codeValidation.valid) {
        return res.status(400).json({
          success: false,
          error: codeValidation.error,
        });
      }

      const urlObject = await urlService.getByShortCode(
        codeValidation.shortCode
      );

      if (!urlObject) {
        return res.status(404).json({
          success: false,
          error: "Short URL not found",
        });
      }

      return res.json({
        success: true,
        data: {
          shortCode: urlObject.short_code,
          originalUrl: urlObject.original_url,
          clickCount: urlObject.click_count,
          createdAt: urlObject.created_at,
          lastAccessed: urlObject.last_accessed,
          expiresAt: urlObject.expires_at,
          isExpired: urlService.isExpired(urlObject),
        },
      });
    } catch (err) {
      console.error("Error getting stats:", err);

      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
}

module.exports = new UrlController();

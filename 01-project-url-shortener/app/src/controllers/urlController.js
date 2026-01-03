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
const {
  BadRequestError,
  NotFoundError,
  GoneError,
  PayloadTooLargeError,
  ConflictError,
} = require("../utils/errors");

/**
 * URL Controller
 * Handles HTTP requests for URL operations
 */

class UrlController {
  /**
   * POST /api/shorten
   * Create a shortened URL
   */
  async shortenUrl(req, res, next) {
    try {
      const { url, customAlias, expiresAt, expiresIn } = req.body;

      // Validate request size
      const sizeValidation = validateRequestSize(req.body);
      if (!sizeValidation.valid) {
        throw new PayloadTooLargeError(sizeValidation.error);
      }

      // Validate URL
      const urlValidation = validateUrl(url);
      if (!urlValidation.valid) {
        throw new BadRequestError(urlValidation.error);
      }

      // Validate custom alias (if provided)
      const aliasValidation = validateCustomAlias(customAlias);
      if (!aliasValidation.valid) {
        throw new BadRequestError(aliasValidation.error);
      }

      // Validate expiration (if provided)
      if (expiresAt && !isValidExpiresAt(expiresAt)) {
        throw new BadRequestError("Invalid expiration date format");
      }

      if (expiresIn && !isValidExpiresIn(expiresIn)) {
        throw new BadRequestError("Invalid expiration duration");
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
      next(err);
    }
  }

  /**
   * GET /:shortCode
   * Redirect to original URL
   */
  async redirectUrl(req, res, next) {
    try {
      const { shortCode } = req.params;

      // Validate short code format
      const codeValidation = validateShortCode(shortCode);
      if (!codeValidation.valid) {
        throw new BadRequestError(codeValidation.error);
      }

      // Get URL from cache (or database if cache miss)
      const urlObject = await cacheService.getUrl(codeValidation.shortCode);

      if (!urlObject) {
        throw new NotFoundError("Short URL not found");
      }

      // Check if expired
      if (urlService.isExpired(urlObject)) {
        throw new GoneError("This short URL has expired");
      }

      // Track click in Redis (super fast, non-blocking)
      analyticsService.trackClick(codeValidation.shortCode).catch((err) => {
        console.error("Error tracking click:", err);
      });

      // Redirect
      return res.redirect(301, urlObject.original_url);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/stats/:shortCode
   * Get analytics for a short URL
   */
  async getStats(req, res, next) {
    try {
      const { shortCode } = req.params;

      // Validate short code format
      const codeValidation = validateShortCode(shortCode);
      if (!codeValidation.valid) {
        throw new BadRequestError(codeValidation.error);
      }

      const urlObject = await urlService.getByShortCode(
        codeValidation.shortCode
      );

      if (!urlObject) {
        throw new NotFoundError("Short URL not found");
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
      next(err);
    }
  }
}

module.exports = new UrlController();

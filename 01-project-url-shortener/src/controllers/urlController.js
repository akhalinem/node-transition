const urlService = require("../services/urlService");

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
      const { url, customAlias, expiresAt } = req.body;

      // Validate input
      if (!url) {
        return res.status(400).json({
          success: false,
          error: "URL is required",
        });
      }

      // Create short URL
      const result = await urlService.createShortUrl(
        url,
        customAlias || null,
        expiresAt || null
      );

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

      // Get URL from database
      const urlObject = await urlService.getByShortCode(shortCode);

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

      // Increment click count (async, don't wait)
      urlService.incrementClickCount(shortCode).catch((err) => {
        console.error("Error updating click count:", err);
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

      const urlObject = await urlService.getByShortCode(shortCode);

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

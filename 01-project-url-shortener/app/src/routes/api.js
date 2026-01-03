const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

/**
 * API Routes
 */

// POST /api/shorten - Create shortened URL
router.post("/shorten", (req, res, next) =>
  urlController.shortenUrl(req, res, next)
);

// GET /api/stats/:shortCode - Get URL statistics
router.get("/stats/:shortCode", (req, res, next) =>
  urlController.getStats(req, res, next)
);

module.exports = router;

const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

/**
 * API Routes
 */

// POST /api/shorten - Create shortened URL
router.post("/shorten", (req, res) => urlController.shortenUrl(req, res));

// GET /api/stats/:shortCode - Get URL statistics
router.get("/stats/:shortCode", (req, res) => urlController.getStats(req, res));

module.exports = router;

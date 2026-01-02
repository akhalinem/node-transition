const express = require("express");
const router = express.Router();
const urlController = require("../controllers/urlController");

/**
 * Redirect Routes
 */

// GET /:shortCode - Redirect to original URL
router.get("/:shortCode", (req, res) => urlController.redirectUrl(req, res));

module.exports = router;

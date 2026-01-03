/**
 * URL Validator
 * Validates URLs before shortening
 */

/**
 * Check if a string is a valid URL
 * @param {string} urlString - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);

    // Only allow http and https protocols
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    // Must have a valid hostname
    if (!url.hostname || url.hostname.length === 0) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Normalize URL (add https:// if missing protocol)
 * @param {string} urlString - URL to normalize
 * @returns {string} Normalized URL
 */
function normalizeUrl(urlString) {
  let url = urlString.trim();

  // Add https:// if no protocol specified
  if (!url.match(/^https?:\/\//i)) {
    url = "https://" + url;
  }

  return url;
}

module.exports = {
  isValidUrl,
  normalizeUrl,
};

/**
 * Validate expiresAt (ISO 8601 date string)
 */
function isValidExpiresAt(expiresAt) {
  if (!expiresAt) {
    return false;
  }

  const expirationDate = new Date(expiresAt);
  const now = new Date();

  // Check if the date is valid and in the future
  return (
    expirationDate instanceof Date &&
    !isNaN(expirationDate) &&
    expirationDate > now
  );
}

/**
 * Validate expiresIn (in seconds)
 */
function isValidExpiresIn(expiresIn) {
  if (!expiresIn) {
    return false;
  }

  // Check if expiresIn is a positive number
  return typeof expiresIn === "number" && expiresIn > 0;
}

module.exports = {
  isValidExpiresAt,
  isValidExpiresIn,
};

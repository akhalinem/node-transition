// Internal utility functions for string validation and manipulation
function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

function isEmptyString(str) {
  return isString(str) && str.trim().length === 0;
}

module.exports = {
  isString,
  isEmptyString
}
/**
 * String Utils - ES Module Browser Build
 * Modern ES module version for browsers
 */

// Case utilities
export const toUpperCase = (str) => str.toUpperCase();
export const toLowerCase = (str) => str.toLowerCase();

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const camelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

export const kebabCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const snakeCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Validation utilities
export const isEmail = (str) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

export const isURL = (str) => {
  const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
  return urlRegex.test(str);
};

export const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const isEmpty = (str) => {
  return str.length === 0;
};

export const hasMinLength = (str, min) => {
  return str.length >= min;
};

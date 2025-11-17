/**
 * String Utils - Browser Build
 * All utilities bundled for browser use
 */

// Case utilities
const toUpperCase = (str) => str.toUpperCase();
const toLowerCase = (str) => str.toLowerCase();

const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const camelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

const kebabCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const snakeCase = (str) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

// Validation utilities
const isEmail = (str) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

const isURL = (str) => {
  const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/i;
  return urlRegex.test(str);
};

const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

const isEmpty = (str) => {
  return str.length === 0;
};

const hasMinLength = (str, min) => {
  return str.length >= min;
};

// Export as UMD for browser compatibility
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD (Require.js)
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS (Node.js)
    module.exports = factory();
  } else {
    // Browser globals
    root.StringUtils = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  return {
    // Case utilities
    toUpperCase,
    toLowerCase,
    capitalize,
    camelCase,
    kebabCase,
    snakeCase,
    
    // Validation utilities
    isEmail,
    isURL,
    isUUID,
    isEmpty,
    hasMinLength
  };
}));

const toUpperCase = (str) => {
  return str.toUpperCase();
};

const toLowerCase = (str) => {
  return str.toLowerCase();
};

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

module.exports = {
  toUpperCase,
  toLowerCase,
  capitalize,
  camelCase,
  kebabCase,
  snakeCase
};
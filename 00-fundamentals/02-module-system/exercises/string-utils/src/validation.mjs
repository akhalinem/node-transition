const isEmail = (str) => {
  // Simple regex for demonstration purposes
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
};

const isURL = (str) => {
  // Simple regex for demonstration purposes
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

export {
  isEmail,
  isURL,
  isUUID,
  isEmpty,
  hasMinLength
}
/**
 * Helper function to set a cookie value.
 */
export const setCookieWithExpiry = (setCookie, key, value, options = {}) => {
  const defaultOptions = {
    path: '/',
    ...options,
  };

  // Stringify the value if it's an object or array
  const valueToStore = typeof value === 'object' ? JSON.stringify(value) : value;

  setCookie(key, valueToStore, defaultOptions);
};

/**
 * Helper function to get a cookie value.
 */
export const getCookieValue = (cookies, key) => {
  const value = cookies[key];
  // Safely attempt to parse the value if it's a JSON string
  try {
    return value ? value : null;
  } catch (error) {
    console.error(`Error parsing cookie value for key "${key}":`, error);
    return null;
  }
};

/**
 * Helper function to check if a cookie is expired.
 */
export const isCookieExpired = (expireDate) => {
  const currentTime = new Date().getTime();
  return expireDate.getTime() < currentTime;
};

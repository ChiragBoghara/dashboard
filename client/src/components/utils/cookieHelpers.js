// Set a cookie with a specified name, value, and expiration in days
export const setCookie = (name, value, days) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires}; path=/`;
};

// Retrieve the value of a specific cookie by name
export const getCookie = (name) => {
  return document.cookie.split("; ").reduce((acc, cookie) => {
    const [key, val] = cookie.split("=");
    return key === name ? decodeURIComponent(val) : acc;
  }, "");
};

// Delete a specific cookie by setting its expiration date to a past date
export const deleteCookie = (name) => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};

//Delete all cookies
export const deleteAllCookies = () => {
  //age=15-20; gender=male; startDate=2024-10-03; endDate=2024-10-25
  document.cookie.split("; ").forEach((cookie) => {
    deleteCookie(cookie.split("=")[0]);
  });
};

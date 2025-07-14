import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

// Secret key for encryption (from environment variables)
const SECRET_KEY =
  import.meta.env.VITE_COOKIE_SECRET_KEY || "windynovel-secret-key-2024";

/**
 * Encrypt data before storing in cookie
 */
const encryptData = (data) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(
      JSON.stringify(data),
      SECRET_KEY
    ).toString();
    return encrypted;
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

/**
 * Decrypt data from cookie
 */
const decryptData = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

/**
 * Set encrypted cookie
 */
export const setSecureCookie = (name, value, options = {}) => {
  try {
    const encryptedValue = encryptData(value);
    if (encryptedValue) {
      const defaultOptions = {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: "strict",
        ...options,
      };
      Cookies.set(name, encryptedValue, defaultOptions);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Set cookie error:", error);
    return false;
  }
};

/**
 * Get and decrypt cookie
 */
export const getSecureCookie = (name) => {
  try {
    const encryptedValue = Cookies.get(name);
    if (encryptedValue) {
      return decryptData(encryptedValue);
    }
    return null;
  } catch (error) {
    console.error("Get cookie error:", error);
    return null;
  }
};

/**
 * Remove cookie
 */
export const removeSecureCookie = (name) => {
  try {
    Cookies.remove(name);
    return true;
  } catch (error) {
    console.error("Remove cookie error:", error);
    return false;
  }
};

/**
 * Check if cookie exists
 */
export const hasCookie = (name) => {
  return Cookies.get(name) !== undefined;
};

/**
 * Clear all auth cookies
 */
export const clearAuthCookies = () => {
  removeSecureCookie("auth_token");
  removeSecureCookie("user_data");
};

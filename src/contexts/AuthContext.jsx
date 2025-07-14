import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import {
  setSecureCookie,
  getSecureCookie,
  clearAuthCookies,
} from "../utils/cookieUtils";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initAuth = async () => {
      const token = getSecureCookie("auth_token");
      const storedUser = getSecureCookie("user_data");

      if (token && storedUser) {
        try {
          // First, set user from cookies immediately
          setUser(storedUser);

          // Then verify token is still valid (optional)
          try {
            const response = await authAPI.getCurrentUser();
            // Update with fresh data from server if needed
            setUser(response.data.data.user);
            // Update user data in cookie with fresh data
            setSecureCookie("user_data", response.data.data.user);
          } catch (error) {
            // If API fails but we have local data, keep using local data
            console.warn(
              "Token verification failed, using cached user data:",
              error
            );
            // Only clear if it's a 401 (unauthorized)
            if (error.response?.status === 401) {
              console.error("Token expired, clearing auth data");
              clearAuthCookies();
              setUser(null);
            }
          }
        } catch (error) {
          // Invalid stored user data
          console.error("Invalid stored user data:", error);
          clearAuthCookies();
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store in secure cookies
        setSecureCookie("auth_token", token, { expires: 7 });
        setSecureCookie("user_data", user, { expires: 7 });

        setUser(user);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng thử lại.",
      };
    }
  };

  // Separate function to set login state directly (for when API call is done externally)
  const setLogin = (user, token) => {
    // Store in secure cookies
    setSecureCookie("auth_token", token, { expires: 7 });
    setSecureCookie("user_data", user, { expires: 7 });

    setUser(user);
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Store in secure cookies
        setSecureCookie("auth_token", token, { expires: 7 });
        setSecureCookie("user_data", user, { expires: 7 });

        setUser(user);
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Đăng ký thất bại. Vui lòng thử lại.",
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      // Always clear cookies and state
      clearAuthCookies();
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    setSecureCookie("user_data", updatedUser, { expires: 7 });
  };

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      const { token } = response.data;
      setSecureCookie("auth_token", token, { expires: 7 });
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await authAPI.changePassword(passwordData);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đổi mật khẩu thất bại";
      return { success: false, error: message };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await authAPI.forgotPassword(email);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Gửi email thất bại";
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    setLogin,
    register,
    logout,
    updateUser,
    refreshToken,
    changePassword,
    forgotPassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

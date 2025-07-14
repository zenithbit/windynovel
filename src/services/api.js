import axios from "axios";
import { getSecureCookie, clearAuthCookies } from "../utils/cookieUtils";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = getSecureCookie("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear cookies and redirect to login
      clearAuthCookies();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  refreshToken: () => api.post("/auth/refresh"),
  getCurrentUser: () => api.get("/auth/me"),
  logout: () => api.post("/auth/logout"),
  changePassword: (passwordData) =>
    api.post("/auth/change-password", passwordData),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
};

// Stories API methods
export const storiesAPI = {
  getAll: (params) => api.get("/stories", { params }),
  getBySlug: (slug) => api.get(`/stories/${slug}`),
  getFeatured: (params) => api.get("/stories/featured", { params }),
  getTrending: (params) => api.get("/stories/trending", { params }),
  getStatistics: () => api.get("/stories/statistics"),
  create: (storyData) => api.post("/stories", storyData),
  update: (id, storyData) => api.put(`/stories/${id}`, storyData),
  delete: (id) => api.delete(`/stories/${id}`),
  publish: (id) => api.put(`/stories/${id}/publish`),
  unpublish: (id) => api.put(`/stories/${id}/unpublish`),
};

// Chapters API methods
export const chaptersAPI = {
  getByStory: (storyId) => api.get(`/chapters/story/${storyId}`),
  getChapter: (storyId, chapterNumber) =>
    api.get(`/chapters/${storyId}/${chapterNumber}`),
  getLatest: () => api.get("/chapters/latest"),
  create: (chapterData) => api.post("/chapters", chapterData),
  update: (id, chapterData) => api.put(`/chapters/${id}`, chapterData),
  delete: (id) => api.delete(`/chapters/${id}`),
  rateChapter: (id, rating) => api.post(`/chapters/${id}/rate`, { rating }),
  getChapterRating: (id) => api.get(`/chapters/${id}/rating`),
  getUserChapterRating: (id) => api.get(`/chapters/${id}/user-rating`),
};

// Users API methods
export const usersAPI = {
  getProfile: (userId) => api.get(`/users/profile/${userId || ""}`),
  updateProfile: (data) => api.put("/users/profile", data),
  getBookmarks: (params) => api.get("/users/bookmarks", { params }),
  addBookmark: (storyId) => api.post(`/users/bookmarks/${storyId}`),
  removeBookmark: (storyId) => api.delete(`/users/bookmarks/${storyId}`),
  getReadingHistory: (params) => api.get("/users/reading-history", { params }),
  updateReadingHistory: (data) => api.post("/users/reading-history", data),
};

// Comments API methods
export const commentsAPI = {
  getByStory: (storyId, params) =>
    api.get(`/comments/story/${storyId}`, { params }),
  getByChapter: (chapterId, params) =>
    api.get(`/comments/chapter/${chapterId}`, { params }),
  create: (data) => api.post("/comments", data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  like: (id) => api.post(`/comments/${id}/like`),
  report: (id, reason) => api.post(`/comments/${id}/report`, { reason }),
};

// Health check
export const healthCheck = () => api.get("/health");

export default api;

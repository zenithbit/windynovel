import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Authentication middleware - verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Authentication error.",
      error: error.message,
    });
  }
};

// Optional authentication - doesn't fail if no token provided
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (user && user.isActive) {
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch {
    // If token is invalid, just set user to null and continue
    req.user = null;
    next();
  }
};

// Authorization middleware - check user roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize("admin");

// User or Admin middleware
export const userOrAdmin = authorize("user", "admin");

// Check if user owns resource or is admin
export const ownerOrAdmin = (resourceUserField = "userId") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication required.",
      });
    }

    // Admin can access everything
    if (req.user.role === "admin") {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId =
      req.resource?.[resourceUserField] || req.params.userId;

    if (req.user._id.toString() === resourceUserId?.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own resources.",
    });
  };
};

// Rate limiting middleware (simple implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

export const rateLimit = (req, res, next) => {
  const identifier = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(identifier)) {
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  const userRequests = requestCounts.get(identifier);

  if (now > userRequests.resetTime) {
    // Reset the count
    requestCounts.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return next();
  }

  if (userRequests.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
    });
  }

  userRequests.count++;
  next();
};

// Cleanup old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [identifier, data] of requestCounts.entries()) {
    if (now > data.resetTime) {
      requestCounts.delete(identifier);
    }
  }
}, RATE_LIMIT_WINDOW);

export default {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  userOrAdmin,
  ownerOrAdmin,
  rateLimit,
};

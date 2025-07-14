import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import path from "path";
import { fileURLToPath } from "url";

// Import routes
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import storyRoutes from "./routes/story.js";
import chapterRoutes from "./routes/chapter.js";
import commentRoutes from "./routes/comment.js";

// Import middleware
import errorHandler from "./middleware/error.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Trust proxy for accurate IP addresses
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
      },
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL || "http://localhost:3000"
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
          ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/", limiter);
}

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Only apply auth rate limiting in production
if (process.env.NODE_ENV === "production") {
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/comments", commentRoutes);

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "WindyNovel API v1.0",
    version: "1.0.0",
    endpoints: {
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        refresh: "POST /api/auth/refresh",
        me: "GET /api/auth/me",
        logout: "POST /api/auth/logout",
        changePassword: "POST /api/auth/change-password",
        forgotPassword: "POST /api/auth/forgot-password",
      },
      users: {
        profile: "GET /api/users/profile/:userId?",
        updateProfile: "PUT /api/users/profile",
        bookmarks: "GET/POST/DELETE /api/users/bookmarks/:storyId?",
        readingHistory: "GET/POST /api/users/reading-history",
        adminRoutes: "GET/PUT /api/users (admin only)",
      },
      stories: {
        getAll: "GET /api/stories",
        getOne: "GET /api/stories/:slug",
        featured: "GET /api/stories/featured",
        trending: "GET /api/stories/trending",
        adminRoutes: "POST/PUT/DELETE /api/stories (admin only)",
      },
      chapters: {
        getByStory: "GET /api/chapters/story/:storyId",
        getOne: "GET /api/chapters/:storyId/:chapterNumber",
        latest: "GET /api/chapters/latest",
        adminRoutes: "POST/PUT/DELETE /api/chapters (admin only)",
      },
      comments: {
        getByStory: "GET /api/comments/story/:storyId",
        getByChapter: "GET /api/comments/chapter/:chapterId",
        create: "POST /api/comments",
        update: "PUT /api/comments/:id",
        delete: "DELETE /api/comments/:id",
        like: "POST /api/comments/:id/like",
        report: "POST /api/comments/:id/report",
        adminRoutes: "GET/PUT/DELETE /api/comments/admin (admin only)",
      },
    },
    documentation:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000/api"
        : "Available in development mode",
  });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "../dist");
  app.use(express.static(staticPath));

  // Handle React routing, return all requests to React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

export default app;

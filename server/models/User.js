import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    profile: {
      displayName: {
        type: String,
        trim: true,
        maxlength: [50, "Display name cannot exceed 50 characters"],
      },
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      favoriteGenres: [
        {
          type: String,
          enum: [
            "học đường",
            "lãng mạn",
            "hành động",
            "viễn tưởng",
            "kinh dị",
            "hài hước",
            "phiêu lưu",
            "drama",
            "khoa học",
            "huyền bí",
          ],
        },
      ],
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      fontSize: {
        type: String,
        enum: ["small", "medium", "large"],
        default: "medium",
      },
      fontFamily: {
        type: String,
        enum: ["serif", "sans-serif", "monospace"],
        default: "serif",
      },
      autoBookmark: {
        type: Boolean,
        default: true,
      },
    },
    bookmarks: [
      {
        storyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Story",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readingHistory: [
      {
        storyId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Story",
          required: true,
        },
        chapterNumber: {
          type: Number,
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          min: 0,
          max: 100,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "bookmarks.storyId": 1 });
userSchema.index({ "readingHistory.storyId": 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add bookmark method
userSchema.methods.addBookmark = function (storyId) {
  const isBookmarked = this.bookmarks.some(
    (bookmark) => bookmark.storyId.toString() === storyId.toString()
  );

  if (!isBookmarked) {
    this.bookmarks.push({ storyId });
  }
  return this.save();
};

// Remove bookmark method
userSchema.methods.removeBookmark = function (storyId) {
  this.bookmarks = this.bookmarks.filter(
    (bookmark) => bookmark.storyId.toString() !== storyId.toString()
  );
  return this.save();
};

// Update reading history method
userSchema.methods.updateReadingHistory = function (
  storyId,
  chapterNumber,
  progress = 0
) {
  const existingIndex = this.readingHistory.findIndex(
    (history) => history.storyId.toString() === storyId.toString()
  );

  if (existingIndex !== -1) {
    // Update existing record
    this.readingHistory[existingIndex].chapterNumber = chapterNumber;
    this.readingHistory[existingIndex].progress = progress;
    this.readingHistory[existingIndex].readAt = new Date();
  } else {
    // Add new record
    this.readingHistory.push({ storyId, chapterNumber, progress });
  }

  // Keep only latest 100 reading history records
  if (this.readingHistory.length > 100) {
    this.readingHistory = this.readingHistory
      .sort((a, b) => b.readAt - a.readAt)
      .slice(0, 100);
  }

  return this.save();
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export default mongoose.model("User", userSchema);

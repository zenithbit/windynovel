import express from "express";
import User from "../models/User.js";
import Story from "../models/Story.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/users/profile/:userId?
// @desc    Get user profile (own or specific user if admin)
// @access  Private
router.get("/profile/:userId?", authenticate, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    // Check permissions
    if (userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own profile.",
      });
    }

    const user = await User.findById(userId)
      .populate("bookmarks.storyId", "title slug author cover tags")
      .populate("readingHistory.storyId", "title slug author cover")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user profile.",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put("/profile", authenticate, async (req, res) => {
  try {
    const { profile, preferences } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Update profile fields
    if (profile) {
      if (profile.displayName !== undefined) {
        user.profile.displayName = profile.displayName;
      }
      if (profile.bio !== undefined) {
        user.profile.bio = profile.bio;
      }
      if (profile.favoriteGenres !== undefined) {
        user.profile.favoriteGenres = profile.favoriteGenres;
      }
    }

    // Update preferences
    if (preferences) {
      if (preferences.theme) {
        user.preferences.theme = preferences.theme;
      }
      if (preferences.fontSize) {
        user.preferences.fontSize = preferences.fontSize;
      }
      if (preferences.fontFamily) {
        user.preferences.fontFamily = preferences.fontFamily;
      }
      if (preferences.autoBookmark !== undefined) {
        user.preferences.autoBookmark = preferences.autoBookmark;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully.",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
      error: error.message,
    });
  }
});

// @route   POST /api/users/bookmarks/:storyId
// @desc    Add story to bookmarks
// @access  Private
router.post("/bookmarks/:storyId", authenticate, async (req, res) => {
  try {
    const { storyId } = req.params;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    const user = await User.findById(req.user._id);
    await user.addBookmark(storyId);

    // Update story bookmark count
    story.bookmarkCount += 1;
    await story.save();

    res.json({
      success: true,
      message: "Story added to bookmarks.",
    });
  } catch (error) {
    console.error("Add bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to bookmark story.",
      error: error.message,
    });
  }
});

// @route   DELETE /api/users/bookmarks/:storyId
// @desc    Remove story from bookmarks
// @access  Private
router.delete("/bookmarks/:storyId", authenticate, async (req, res) => {
  try {
    const { storyId } = req.params;
    const user = await User.findById(req.user._id);

    const wasBookmarked = user.bookmarks.some(
      (bookmark) => bookmark.storyId.toString() === storyId
    );

    if (!wasBookmarked) {
      return res.status(400).json({
        success: false,
        message: "Story is not bookmarked.",
      });
    }

    await user.removeBookmark(storyId);

    // Update story bookmark count
    const story = await Story.findById(storyId);
    if (story) {
      story.bookmarkCount = Math.max(0, story.bookmarkCount - 1);
      await story.save();
    }

    res.json({
      success: true,
      message: "Story removed from bookmarks.",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove bookmark.",
      error: error.message,
    });
  }
});

// @route   GET /api/users/bookmarks
// @desc    Get user bookmarks
// @access  Private
router.get("/bookmarks", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: "bookmarks.storyId",
        select:
          "title slug author cover tags status viewCount likeCount bookmarkCount rating updatedAt",
      })
      .select("bookmarks");

    // Filter out deleted stories first
    const validBookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.storyId
    );

    // Sort by addedAt date (newest first)
    validBookmarks.sort((a, b) => b.addedAt - a.addedAt);

    // Apply pagination
    const bookmarks = validBookmarks.slice(skip, skip + limit);
    const total = validBookmarks.length;

    res.json({
      success: true,
      data: {
        bookmarks,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get bookmarks.",
      error: error.message,
    });
  }
});

// @route   POST /api/users/reading-history
// @desc    Update reading history
// @access  Private
router.post("/reading-history", authenticate, async (req, res) => {
  try {
    const { storyId, chapterNumber, progress = 0 } = req.body;

    if (!storyId || !chapterNumber) {
      return res.status(400).json({
        success: false,
        message: "Story ID and chapter number are required.",
      });
    }

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    const user = await User.findById(req.user._id);
    await user.updateReadingHistory(storyId, chapterNumber, progress);

    res.json({
      success: true,
      message: "Reading history updated.",
    });
  } catch (error) {
    console.error("Update reading history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update reading history.",
      error: error.message,
    });
  }
});

// @route   GET /api/users/reading-history
// @desc    Get user reading history
// @access  Private
router.get("/reading-history", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: "readingHistory.storyId",
        select: "title slug author cover tags status totalChapters updatedAt",
      })
      .select("readingHistory");

    const history = user.readingHistory
      .filter((item) => item.storyId) // Filter out deleted stories
      .sort((a, b) => b.readAt - a.readAt)
      .slice(skip, skip + limit);

    const total = user.readingHistory.length;

    res.json({
      success: true,
      data: {
        history,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get reading history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get reading history.",
      error: error.message,
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get("/", authenticate, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role;

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users.",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:userId/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put("/:userId/role", authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either "user" or "admin".',
      });
    }

    // Prevent admin from changing their own role
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: { user },
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role.",
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:userId/status
// @desc    Activate/deactivate user (admin only)
// @access  Private/Admin
router.put("/:userId/status", authenticate, adminOnly, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean value.",
      });
    }

    // Prevent admin from deactivating themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own account status.",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      message: `User account ${isActive ? "activated" : "deactivated"}.`,
      data: { user },
    });
  } catch (error) {
    console.error("Update user status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
      error: error.message,
    });
  }
});

export default router;

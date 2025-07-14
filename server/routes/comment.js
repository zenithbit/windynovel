import express from "express";
import Comment from "../models/Comment.js";
import Story from "../models/Story.js";
import Chapter from "../models/Chapter.js";
import { authenticate, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/comments/story/:storyId
// @desc    Get comments for a story
// @access  Public
router.get("/story/:storyId", async (req, res) => {
  try {
    const { storyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story || !story.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    const comments = await Comment.find({
      storyId,
      isDeleted: false,
      isApproved: true,
    })
      .populate("userId", "username profile.displayName profile.avatar")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      storyId,
      isDeleted: false,
      isApproved: true,
    });

    res.json({
      success: true,
      data: {
        comments,
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
    console.error("Get story comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get comments.",
      error: error.message,
    });
  }
});

// @route   GET /api/comments/chapter/:chapterId
// @desc    Get comments for a chapter
// @access  Public
router.get("/chapter/:chapterId", async (req, res) => {
  try {
    const { chapterId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Check if chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter || !chapter.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    const comments = await Comment.find({
      chapterId,
      isDeleted: false,
      isApproved: true,
    })
      .populate("userId", "username profile.displayName profile.avatar")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      chapterId,
      isDeleted: false,
      isApproved: true,
    });

    res.json({
      success: true,
      data: {
        comments,
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
    console.error("Get chapter comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get comments.",
      error: error.message,
    });
  }
});

// @route   POST /api/comments
// @desc    Create a new comment
// @access  Private
router.post("/", authenticate, async (req, res) => {
  try {
    const { content, storyId, chapterId, parentId } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required.",
      });
    }

    if (!storyId && !chapterId) {
      return res.status(400).json({
        success: false,
        message: "Either story ID or chapter ID is required.",
      });
    }

    // Check if story/chapter exists
    if (storyId) {
      const story = await Story.findById(storyId);
      if (!story || !story.isPublished) {
        return res.status(404).json({
          success: false,
          message: "Story not found.",
        });
      }
    }

    if (chapterId) {
      const chapter = await Chapter.findById(chapterId);
      if (!chapter || !chapter.isPublished) {
        return res.status(404).json({
          success: false,
          message: "Chapter not found.",
        });
      }
    }

    // Check if parent comment exists (for replies)
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.isDeleted) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found.",
        });
      }
    }

    const comment = new Comment({
      content: content.trim(),
      userId: req.user._id,
      storyId: storyId || null,
      chapterId: chapterId || null,
      parentId: parentId || null,
    });

    await comment.save();

    // Populate user data for response
    await comment.populate(
      "userId",
      "username profile.displayName profile.avatar"
    );

    res.status(201).json({
      success: true,
      message: "Comment created successfully.",
      data: { comment },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create comment.",
      error: error.message,
    });
  }
});

// @route   PUT /api/comments/:id
// @desc    Update a comment
// @access  Private
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required.",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Check ownership or admin permission
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit your own comments.",
      });
    }

    comment.content = content.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

    // Populate user data for response
    await comment.populate(
      "userId",
      "username profile.displayName profile.avatar"
    );

    res.json({
      success: true,
      message: "Comment updated successfully.",
      data: { comment },
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment.",
      error: error.message,
    });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Check ownership or admin permission
    if (
      comment.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own comments.",
      });
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();

    await comment.save();

    res.json({
      success: true,
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
      error: error.message,
    });
  }
});

// @route   POST /api/comments/:id/like
// @desc    Like/unlike a comment
// @access  Private
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted || !comment.isApproved) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    const userId = req.user._id;
    const hasLiked = comment.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      comment.likes = comment.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({
      success: true,
      message: hasLiked ? "Comment unliked." : "Comment liked.",
      data: {
        liked: !hasLiked,
        likeCount: comment.likes.length,
      },
    });
  } catch (error) {
    console.error("Toggle comment like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle comment like.",
      error: error.message,
    });
  }
});

// @route   POST /api/comments/:id/report
// @desc    Report a comment
// @access  Private
router.post("/:id/report", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Report reason is required.",
      });
    }

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    // Check if user already reported this comment
    const existingReport = comment.reports.find(
      (report) => report.reportedBy.toString() === req.user._id.toString()
    );

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You have already reported this comment.",
      });
    }

    comment.reports.push({
      reportedBy: req.user._id,
      reason: reason.trim(),
    });

    await comment.save();

    res.json({
      success: true,
      message:
        "Comment reported successfully. Thank you for helping keep our community safe.",
    });
  } catch (error) {
    console.error("Report comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to report comment.",
      error: error.message,
    });
  }
});

// @route   GET /api/comments/admin/all
// @desc    Get all comments for admin (including deleted and unapproved)
// @access  Private/Admin
router.get("/admin/all", authenticate, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const isApproved = req.query.isApproved;
    const isDeleted = req.query.isDeleted;
    const hasReports = req.query.hasReports;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    const query = {};

    if (search) {
      query.content = { $regex: search, $options: "i" };
    }

    if (isApproved !== undefined) {
      query.isApproved = isApproved === "true";
    }

    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === "true";
    }

    if (hasReports === "true") {
      query["reports.0"] = { $exists: true };
    }

    const comments = await Comment.find(query)
      .populate("userId", "username profile.displayName")
      .populate("storyId", "title slug")
      .populate("chapterId", "title number")
      .populate("reports.reportedBy", "username")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments(query);

    res.json({
      success: true,
      data: {
        comments,
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
    console.error("Get admin comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get comments.",
      error: error.message,
    });
  }
});

// @route   PUT /api/comments/:id/approve
// @desc    Approve/unapprove a comment
// @access  Private/Admin
router.put("/:id/approve", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (typeof isApproved !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isApproved must be a boolean value.",
      });
    }

    const comment = await Comment.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    res.json({
      success: true,
      message: `Comment ${
        isApproved ? "approved" : "unapproved"
      } successfully.`,
      data: { comment },
    });
  } catch (error) {
    console.error("Approve comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update comment approval status.",
      error: error.message,
    });
  }
});

// @route   DELETE /api/comments/:id/admin
// @desc    Permanently delete a comment (admin only)
// @access  Private/Admin
router.delete("/:id/admin", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found.",
      });
    }

    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Comment permanently deleted.",
    });
  } catch (error) {
    console.error("Admin delete comment error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete comment.",
      error: error.message,
    });
  }
});

// @route   GET /api/comments/user/:userId
// @desc    Get comments by user
// @access  Private
router.get("/user/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Users can only view their own comments unless they're admin
    if (userId !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    const comments = await Comment.find({
      userId,
      isDeleted: false,
    })
      .populate("storyId", "title slug")
      .populate("chapterId", "title number")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Comment.countDocuments({
      userId,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        comments,
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
    console.error("Get user comments error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user comments.",
      error: error.message,
    });
  }
});

export default router;

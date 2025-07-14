import express from "express";
import Story from "../models/Story.js";
import Chapter from "../models/Chapter.js";
import User from "../models/User.js";
import { authenticate, adminOnly, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/stories
// @desc    Get all published stories with pagination and filtering
// @access  Public
router.get("/", optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const tags = req.query.tags ? req.query.tags.split(",") : [];
    const status = req.query.status;
    const sortBy = req.query.sortBy || "updatedAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    const query = { isPublished: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (status) {
      query.status = status;
    }

    // Build sort object
    let sortObj = {};
    if (search && !req.query.sortBy) {
      // If searching, sort by text score
      sortObj = { score: { $meta: "textScore" } };
    } else {
      sortObj[sortBy] = sortOrder;
    }

    const stories = await Story.find(query)
      .populate("createdBy", "username")
      .select(
        "title slug author translator description cover tags status totalChapters viewCount likeCount bookmarkCount rating featured updatedAt createdAt"
      )
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: {
        stories,
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
    console.error("Get stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stories.",
      error: error.message,
    });
  }
});

// @route   GET /api/stories/featured
// @desc    Get featured stories
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const stories = await Story.findFeatured()
      .populate("createdBy", "username")
      .select(
        "title slug author translator description cover tags status totalChapters viewCount likeCount bookmarkCount rating featuredOrder updatedAt"
      )
      .limit(limit);

    res.json({
      success: true,
      data: { stories },
    });
  } catch (error) {
    console.error("Get featured stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get featured stories.",
      error: error.message,
    });
  }
});

// @route   GET /api/stories/trending
// @desc    Get trending stories (most viewed in last 7 days)
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      isPublished: true,
      updatedAt: { $gte: sevenDaysAgo },
    })
      .populate("createdBy", "username")
      .select(
        "title slug author translator description cover tags status totalChapters viewCount likeCount bookmarkCount rating updatedAt"
      )
      .sort({ viewCount: -1, likeCount: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: { stories },
    });
  } catch (error) {
    console.error("Get trending stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get trending stories.",
      error: error.message,
    });
  }
});

// @route   GET /api/stories/statistics
// @desc    Get platform statistics
// @access  Public
router.get("/statistics", async (req, res) => {
  try {
    // Get story count
    const storyCount = await Story.countDocuments({ isPublished: true });

    // Get unique author count
    const uniqueAuthors = await Story.distinct("author", { isPublished: true });
    const authorCount = uniqueAuthors.length;

    // Get user count (readers)
    const userCount = await User.countDocuments({});

    // Get total view count
    const totalViews = await Story.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, totalViews: { $sum: "$viewCount" } } },
    ]);

    const viewCount = totalViews.length > 0 ? totalViews[0].totalViews : 0;

    res.json({
      success: true,
      data: {
        statistics: {
          stories: storyCount,
          authors: authorCount,
          readers: userCount,
          totalViews: viewCount,
        },
      },
    });
  } catch (error) {
    console.error("Get statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics.",
      error: error.message,
    });
  }
});

// @route   GET /api/stories/:slug
// @desc    Get story by slug
// @access  Public
router.get("/:slug", optionalAuth, async (req, res) => {
  try {
    const { slug } = req.params;

    const story = await Story.findOne({ slug, isPublished: true }).populate(
      "createdBy",
      "username profile.displayName"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Increment view count
    await story.incrementView();

    // Get chapter count
    const chapterCount = await Chapter.countDocuments({
      storyId: story._id,
      isPublished: true,
    });

    // Check if user has bookmarked this story
    let isBookmarked = false;
    if (req.user) {
      isBookmarked = req.user.bookmarks.some(
        (bookmark) => bookmark.storyId.toString() === story._id.toString()
      );
    }

    res.json({
      success: true,
      data: {
        story: {
          ...story.toObject(),
          chapterCount,
          isBookmarked,
        },
      },
    });
  } catch (error) {
    console.error("Get story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get story.",
      error: error.message,
    });
  }
});

// @route   POST /api/stories
// @desc    Create new story (any authenticated user)
// @access  Private
router.post("/", authenticate, async (req, res) => {
  try {
    const {
      title,
      author,
      translator,
      description,
      cover,
      tags,
      status = "ongoing",
    } = req.body;

    // Validation
    if (!title || !author || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, author, and description are required.",
      });
    }

    // Check if story with same title already exists
    const existingStory = await Story.findOne({ title });
    if (existingStory) {
      return res.status(400).json({
        success: false,
        message: "A story with this title already exists.",
      });
    }

    // Generate slug manually as a fallback
    let slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    // If slug is empty after processing, use a default
    if (!slug) {
      slug = "untitled-story";
    }

    // Ensure uniqueness
    let finalSlug = slug;
    let counter = 1;
    while (await Story.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const story = new Story({
      title,
      slug: finalSlug,
      author,
      translator,
      description,
      cover,
      tags: tags || [],
      status,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id,
    });

    await story.save();

    res.status(201).json({
      success: true,
      message: "Story created successfully.",
      data: { story },
    });
  } catch (error) {
    console.error("Create story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create story.",
      error: error.message,
    });
  }
});

// @route   PUT /api/stories/:id
// @desc    Update story (story owner or admin)
// @access  Private
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if story exists
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Check if user owns the story or is admin
    if (
      story.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only update your own stories.",
      });
    }

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.viewCount;
    delete updateData.likeCount;
    delete updateData.bookmarkCount;
    delete updateData.rating;

    // Set lastUpdatedBy
    updateData.lastUpdatedBy = req.user._id;

    const updatedStory = await Story.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      message: "Story updated successfully.",
      data: { story: updatedStory },
    });
  } catch (error) {
    console.error("Update story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update story.",
      error: error.message,
    });
  }
});

// @route   PUT /api/stories/:id/publish
// @desc    Toggle story publish status (admin only)
// @access  Private/Admin
router.put("/:id/publish", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;

    if (typeof isPublished !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isPublished must be a boolean value.",
      });
    }

    const story = await Story.findByIdAndUpdate(
      id,
      {
        isPublished,
        lastUpdatedBy: req.user._id,
      },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    res.json({
      success: true,
      message: `Story ${
        isPublished ? "published" : "unpublished"
      } successfully.`,
      data: { story },
    });
  } catch (error) {
    console.error("Publish story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update story publish status.",
      error: error.message,
    });
  }
});

// @route   PUT /api/stories/:id/feature
// @desc    Toggle story featured status (admin only)
// @access  Private/Admin
router.put("/:id/feature", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { featured, featuredOrder = 0 } = req.body;

    if (typeof featured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "featured must be a boolean value.",
      });
    }

    const story = await Story.findByIdAndUpdate(
      id,
      {
        featured,
        featuredOrder: featured ? featuredOrder : 0,
        lastUpdatedBy: req.user._id,
      },
      { new: true }
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    res.json({
      success: true,
      message: `Story ${featured ? "featured" : "unfeatured"} successfully.`,
      data: { story },
    });
  } catch (error) {
    console.error("Feature story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update story featured status.",
      error: error.message,
    });
  }
});

// @route   DELETE /api/stories/:id
// @desc    Delete story (story owner or admin)
// @access  Private
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if story exists
    const story = await Story.findById(id);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Check if user owns the story or is admin
    if (
      story.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only delete your own stories.",
      });
    }

    await Story.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Story deleted successfully.",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete story.",
      error: error.message,
    });
  }
});

// @route   GET /api/stories/admin/all
// @desc    Get all stories for admin (including unpublished)
// @access  Private/Admin
router.get("/admin/all", authenticate, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status;
    const isPublished = req.query.isPublished;
    const sortBy = req.query.sortBy || "updatedAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    const stories = await Story.find(query)
      .populate("createdBy", "username")
      .populate("lastUpdatedBy", "username")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Story.countDocuments(query);

    res.json({
      success: true,
      data: {
        stories,
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
    console.error("Get admin stories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get stories.",
      error: error.message,
    });
  }
});

export default router;

import express from "express";
import Chapter from "../models/Chapter.js";
import Story from "../models/Story.js";
import { authenticate, adminOnly, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/chapters/story/:storyId
// @desc    Get chapters for a story
// @access  Public
router.get("/story/:storyId", optionalAuth, async (req, res) => {
  try {
    const { storyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if story exists
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Check if user is the author
    const isAuthor =
      req.user && req.user._id.toString() === story.createdBy.toString();

    // If story is not published and user is not the author, return 404
    if (!story.isPublished && !isAuthor) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Get chapters - show unpublished ones only to author
    const showUnpublished = isAuthor;
    const chapters = await Chapter.findByStory(storyId, !showUnpublished)
      .select(
        "number title wordCount viewCount likeCount publishedAt createdAt isPublished"
      )
      .skip(skip)
      .limit(limit);

    // Count total chapters based on access level
    const countQuery = { storyId };
    if (!showUnpublished) {
      countQuery.isPublished = true;
    }
    const total = await Chapter.countDocuments(countQuery);

    res.json({
      success: true,
      data: {
        chapters,
        story: {
          id: story._id,
          title: story.title,
          author: story.author,
          slug: story.slug,
        },
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
    console.error("Get chapters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chapters.",
      error: error.message,
    });
  }
});

// @route   GET /api/chapters/latest
// @desc    Get latest published chapters across all stories
// @access  Public
router.get("/latest", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const chapters = await Chapter.findLatestChapters(limit);

    res.json({
      success: true,
      data: { chapters },
    });
  } catch (error) {
    console.error("Get latest chapters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get latest chapters.",
      error: error.message,
    });
  }
});

// @route   GET /api/chapters/admin/all
// @desc    Get all chapters for admin (including unpublished)
// @access  Private/Admin
router.get("/admin/all", authenticate, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const storyId = req.query.storyId;
    const search = req.query.search || "";
    const isPublished = req.query.isPublished;
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    // Build query
    const query = {};

    if (storyId) {
      query.storyId = storyId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    if (isPublished !== undefined) {
      query.isPublished = isPublished === "true";
    }

    const chapters = await Chapter.find(query)
      .populate("storyId", "title slug author")
      .populate("createdBy", "username")
      .populate("lastUpdatedBy", "username")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await Chapter.countDocuments(query);

    res.json({
      success: true,
      data: {
        chapters,
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
    console.error("Get admin chapters error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chapters.",
      error: error.message,
    });
  }
});

// @route   POST /api/chapters
// @desc    Create new chapter (story owner or admin)
// @access  Private
router.post("/", authenticate, async (req, res) => {
  try {
    const { storyId, number, title, content, notes } = req.body;

    // Validation
    if (!storyId || !number || !title || !content) {
      return res.status(400).json({
        success: false,
        message: "Story ID, chapter number, title, and content are required.",
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

    // Check if user owns the story or is admin
    if (
      story.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You can only create chapters for your own stories.",
      });
    }

    // Check if chapter number already exists for this story
    const existingChapter = await Chapter.findOne({ storyId, number });
    if (existingChapter) {
      return res.status(400).json({
        success: false,
        message: `Chapter ${number} already exists for this story.`,
      });
    }

    const chapter = new Chapter({
      storyId,
      number,
      title,
      content,
      notes,
      createdBy: req.user._id,
      lastUpdatedBy: req.user._id,
    });

    await chapter.save();

    // Update story's total chapter count
    await Story.findByIdAndUpdate(storyId, {
      $inc: { totalChapters: 1 },
      lastUpdatedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Chapter created successfully.",
      data: { chapter },
    });
  } catch (error) {
    console.error("Create chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create chapter.",
      error: error.message,
    });
  }
});

// @route   PUT /api/chapters/:id
// @desc    Update chapter (admin only)
// @access  Private/Admin
router.put("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.storyId;
    delete updateData.createdBy;
    delete updateData.viewCount;
    delete updateData.likeCount;
    delete updateData.wordCount; // This is auto-calculated

    // Set lastUpdatedBy
    updateData.lastUpdatedBy = req.user._id;

    const chapter = await Chapter.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    res.json({
      success: true,
      message: "Chapter updated successfully.",
      data: { chapter },
    });
  } catch (error) {
    console.error("Update chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update chapter.",
      error: error.message,
    });
  }
});

// @route   PUT /api/chapters/:id/publish
// @desc    Toggle chapter publish status (admin only)
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

    const chapter = await Chapter.findByIdAndUpdate(
      id,
      {
        isPublished,
        lastUpdatedBy: req.user._id,
      },
      { new: true }
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    res.json({
      success: true,
      message: `Chapter ${
        isPublished ? "published" : "unpublished"
      } successfully.`,
      data: { chapter },
    });
  } catch (error) {
    console.error("Publish chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update chapter publish status.",
      error: error.message,
    });
  }
});

// @route   DELETE /api/chapters/:id
// @desc    Delete chapter (admin only)
// @access  Private/Admin
router.delete("/:id", authenticate, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    // Delete the chapter
    await Chapter.findByIdAndDelete(id);

    // Update story's total chapter count
    await Story.findByIdAndUpdate(chapter.storyId, {
      $inc: { totalChapters: -1 },
      lastUpdatedBy: req.user._id,
    });

    res.json({
      success: true,
      message: "Chapter deleted successfully.",
    });
  } catch (error) {
    console.error("Delete chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete chapter.",
      error: error.message,
    });
  }
});

// @route   POST /api/chapters/:id/like
// @desc    Like/unlike a chapter
// @access  Private
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter || !chapter.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    await chapter.toggleLike();

    res.json({
      success: true,
      message: "Chapter like toggled.",
      data: {
        likeCount: chapter.likeCount,
      },
    });
  } catch (error) {
    console.error("Toggle chapter like error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle chapter like.",
      error: error.message,
    });
  }
});

// @route   POST /api/chapters/:id/rate
// @desc    Rate a chapter
// @access  Private
router.post("/:id/rate", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const chapter = await Chapter.findById(id);
    if (!chapter || !chapter.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    // Check if user already rated this chapter
    const existingRating = chapter.ratings.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.ratedAt = new Date();
    } else {
      // Add new rating
      chapter.ratings.push({
        userId: req.user._id,
        rating: rating,
      });
    }

    // Recalculate average rating
    const totalRating = chapter.ratings.reduce((sum, r) => sum + r.rating, 0);
    chapter.ratingAverage = totalRating / chapter.ratings.length;
    chapter.ratingCount = chapter.ratings.length;

    await chapter.save();

    res.json({
      success: true,
      message: existingRating ? "Rating updated." : "Rating added.",
      data: {
        average: chapter.ratingAverage,
        count: chapter.ratingCount,
        userRating: rating,
      },
    });
  } catch (error) {
    console.error("Rate chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to rate chapter.",
      error: error.message,
    });
  }
});

// @route   GET /api/chapters/:id/rating
// @desc    Get chapter rating statistics
// @access  Public
router.get("/:id/rating", async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter || !chapter.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    res.json({
      success: true,
      data: {
        average: chapter.ratingAverage || 0,
        count: chapter.ratingCount || 0,
      },
    });
  } catch (error) {
    console.error("Get chapter rating error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chapter rating.",
      error: error.message,
    });
  }
});

// @route   GET /api/chapters/:id/user-rating
// @desc    Get user's rating for a chapter
// @access  Private
router.get("/:id/user-rating", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const chapter = await Chapter.findById(id);
    if (!chapter || !chapter.isPublished) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    const userRating = chapter.ratings.find(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      data: {
        userRating: userRating ? userRating.rating : 0,
      },
    });
  } catch (error) {
    console.error("Get user chapter rating error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user rating.",
      error: error.message,
    });
  }
});

// @route   GET /api/chapters/:storyId/:chapterNumber
// @desc    Get specific chapter content
// @access  Public
router.get("/:storyId/:chapterNumber", optionalAuth, async (req, res) => {
  try {
    const { storyId, chapterNumber } = req.params;

    // Get story info
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Check if user is the author
    const isAuthor =
      req.user && req.user._id.toString() === story.createdBy.toString();

    // If story is not published and user is not the author, return 404
    if (!story.isPublished && !isAuthor) {
      return res.status(404).json({
        success: false,
        message: "Story not found.",
      });
    }

    // Get chapter - authors can see unpublished chapters
    const chapterQuery = {
      storyId,
      number: parseInt(chapterNumber),
    };
    if (!isAuthor) {
      chapterQuery.isPublished = true;
    }

    const chapter = await Chapter.findOne(chapterQuery).populate(
      "createdBy",
      "username profile.displayName"
    );

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: "Chapter not found.",
      });
    }

    // Increment chapter view count only for published chapters
    if (chapter.isPublished) {
      await chapter.incrementView();
    }

    // Get next and previous chapters - authors can see unpublished ones
    const [nextChapter, prevChapter] = await Promise.all([
      isAuthor
        ? Chapter.findOne({ storyId, number: chapter.number + 1 }).select(
            "number title"
          )
        : Chapter.getNextChapter(storyId, chapter.number),
      isAuthor
        ? Chapter.findOne({ storyId, number: chapter.number - 1 }).select(
            "number title"
          )
        : Chapter.getPreviousChapter(storyId, chapter.number),
    ]);

    // Update user reading history if authenticated and chapter is published
    if (req.user && chapter.isPublished) {
      await req.user.updateReadingHistory(storyId, chapter.number);
    }

    res.json({
      success: true,
      data: {
        chapter,
        story: {
          id: story._id,
          title: story.title,
          author: story.author,
          slug: story.slug,
        },
        navigation: {
          next: nextChapter
            ? {
                number: nextChapter.number,
                title: nextChapter.title,
              }
            : null,
          previous: prevChapter
            ? {
                number: prevChapter.number,
                title: prevChapter.title,
              }
            : null,
        },
      },
    });
  } catch (error) {
    console.error("Get chapter error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get chapter.",
      error: error.message,
    });
  }
});

export default router;

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      default: null,
      index: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      default: null,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    isReply: {
      type: Boolean,
      default: false,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    likes: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        likedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    reports: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        reason: {
          type: String,
          required: true,
          enum: ["spam", "inappropriate", "harassment", "other"],
        },
        reportedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ chapterId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ isDeleted: 1 });
commentSchema.index({ createdAt: -1 });

// Virtual for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentId",
});

// Set isReply based on parentId
commentSchema.pre("save", function (next) {
  this.isReply = Boolean(this.parentId);

  // Validate that at least one of storyId or chapterId is provided
  if (!this.storyId && !this.chapterId) {
    next(new Error("Either storyId or chapterId must be provided"));
    return;
  }

  next();
});

// Update parent comment reply count
commentSchema.post("save", async function () {
  if (this.parentId && !this.isDeleted) {
    await this.constructor.updateReplyCount(this.parentId);
  }
});

// Update parent comment reply count when comment is deleted
commentSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.parentId && doc.isDeleted) {
    await doc.constructor.updateReplyCount(doc.parentId);
  }
});

// Methods
commentSchema.methods.toggleLike = async function (userId) {
  const existingLike = this.likes.find(
    (like) => like.userId.toString() === userId.toString()
  );

  if (existingLike) {
    // Remove like
    this.likes = this.likes.filter(
      (like) => like.userId.toString() !== userId.toString()
    );
    this.likeCount = Math.max(0, this.likeCount - 1);
  } else {
    // Add like
    this.likes.push({ userId });
    this.likeCount += 1;
  }

  return await this.save();
};

commentSchema.methods.addReport = async function (userId, reason) {
  const existingReport = this.reports.find(
    (report) => report.userId.toString() === userId.toString()
  );

  if (!existingReport) {
    this.reports.push({ userId, reason });
    return await this.save();
  }

  return this;
};

commentSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.content = "[Comment has been deleted]";

  // Update parent reply count if this is a reply
  if (this.parentId) {
    await this.constructor.updateReplyCount(this.parentId);
  }

  return await this.save();
};

// Static methods
commentSchema.statics.findByChapter = function (
  chapterId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  return this.find({
    chapterId,
    parentId: null, // Only top-level comments
    isDeleted: false,
  })
    .populate("userId", "username avatar profile.displayName")
    .populate({
      path: "replies",
      match: { isDeleted: false },
      populate: {
        path: "userId",
        select: "username avatar profile.displayName",
      },
      options: { sort: { createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

commentSchema.statics.updateReplyCount = async function (parentId) {
  const replyCount = await this.countDocuments({
    parentId,
    isDeleted: false,
  });

  await this.findByIdAndUpdate(parentId, { replyCount });
};

commentSchema.statics.findUserComments = function (
  userId,
  page = 1,
  limit = 20
) {
  const skip = (page - 1) * limit;

  return this.find({ userId, isDeleted: false })
    .populate("chapterId", "title number")
    .populate("storyId", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

commentSchema.statics.findLatestComments = function (limit = 10) {
  return this.find({ isDeleted: false, parentId: null })
    .populate("userId", "username avatar profile.displayName")
    .populate("chapterId", "title number")
    .populate("storyId", "title slug")
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Transform for JSON response
commentSchema.methods.toJSON = function () {
  const comment = this.toObject();

  // Hide sensitive data
  delete comment.reports;
  delete comment.likes;

  // Add user like status (will be added by controller)
  comment.isLiked = false;

  return comment;
};

export default mongoose.model("Comment", commentSchema);

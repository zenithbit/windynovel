import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: [true, "Story ID is required"],
      index: true,
    },
    number: {
      type: Number,
      required: [true, "Chapter number is required"],
      min: [1, "Chapter number must be at least 1"],
    },
    title: {
      type: String,
      required: [true, "Chapter title is required"],
      trim: true,
      maxlength: [200, "Chapter title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Chapter content is required"],
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    ratings: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        ratedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique chapter numbers per story
chapterSchema.index({ storyId: 1, number: 1 }, { unique: true });

// Other indexes
chapterSchema.index({ isPublished: 1 });
chapterSchema.index({ publishedAt: -1 });
chapterSchema.index({ createdAt: -1 });

// Auto-calculate word count
chapterSchema.pre("save", function (next) {
  if (this.isModified("content")) {
    // Simple word count (split by whitespace)
    this.wordCount = this.content.trim().split(/\s+/).length;
  }
  next();
});

// Update publishedAt when published
chapterSchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Methods
chapterSchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save();
};

chapterSchema.methods.toggleLike = function () {
  this.likeCount += 1;
  return this.save();
};

// Static methods
chapterSchema.statics.findByStory = function (storyId, published = true) {
  const query = { storyId };
  if (published) {
    query.isPublished = true;
  }
  return this.find(query).sort({ number: 1 });
};

chapterSchema.statics.findLatestChapters = function (limit = 10) {
  return this.find({ isPublished: true })
    .populate("storyId", "title slug author")
    .sort({ publishedAt: -1 })
    .limit(limit);
};

chapterSchema.statics.getNextChapter = function (storyId, currentNumber) {
  return this.findOne({
    storyId,
    number: currentNumber + 1,
    isPublished: true,
  });
};

chapterSchema.statics.getPreviousChapter = function (storyId, currentNumber) {
  return this.findOne({
    storyId,
    number: currentNumber - 1,
    isPublished: true,
  });
};

export default mongoose.model("Chapter", chapterSchema);

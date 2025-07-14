import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Story title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [100, "Author name cannot exceed 100 characters"],
    },
    translator: {
      type: String,
      trim: true,
      maxlength: [100, "Translator name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    cover: {
      type: String,
      default: null,
    },
    tags: [
      {
        type: String,
        trim: true,
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
    status: {
      type: String,
      enum: ["ongoing", "completed", "paused", "dropped"],
      default: "ongoing",
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    bookmarkCount: {
      type: Number,
      default: 0,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
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
    featured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
storySchema.index({ slug: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ status: 1 });
storySchema.index({ isPublished: 1 });
storySchema.index({ featured: 1, featuredOrder: 1 });
storySchema.index({ viewCount: -1 });
storySchema.index({ likeCount: -1 });
storySchema.index({ bookmarkCount: -1 });
storySchema.index({ "rating.average": -1 });
storySchema.index({ updatedAt: -1 });

// Text search index
storySchema.index({
  title: "text",
  author: "text",
  description: "text",
  tags: "text",
});

// Virtual for chapter count
storySchema.virtual("chapters", {
  ref: "Chapter",
  localField: "_id",
  foreignField: "storyId",
  count: true,
});

// Auto-generate slug from title
storySchema.pre("save", async function (next) {
  console.log("Pre-save middleware triggered");
  console.log("isNew:", this.isNew);
  console.log("isModified('title'):", this.isModified("title"));
  console.log("current slug:", this.slug);
  console.log("title:", this.title);

  if ((this.isNew || this.isModified("title")) && !this.slug) {
    console.log("Generating slug for title:", this.title);

    let baseSlug = this.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/--+/g, "-") // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens

    console.log("Base slug after processing:", baseSlug);

    // If slug is empty after processing, use a default
    if (!baseSlug) {
      baseSlug = "untitled-story";
      console.log("Using default slug:", baseSlug);
    }

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
      const existingStory = await this.constructor.findOne({
        slug: slug,
        _id: { $ne: this._id },
      });

      if (!existingStory) {
        isUnique = true;
        console.log("Final unique slug:", slug);
      } else {
        slug = `${baseSlug}-${counter}`;
        counter++;
        console.log("Slug exists, trying:", slug);
      }
    }

    this.slug = slug;
    console.log("Slug set to:", this.slug);
  } else {
    console.log("Slug generation skipped - conditions not met");
  }
  next();
});

// Update publishedAt when published
storySchema.pre("save", function (next) {
  if (this.isModified("isPublished") && this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Methods
storySchema.methods.incrementView = function () {
  this.viewCount += 1;
  return this.save();
};

storySchema.methods.updateRating = function (newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

// Static methods
storySchema.statics.findPublished = function () {
  return this.find({ isPublished: true });
};

storySchema.statics.findByTag = function (tag) {
  return this.find({ tags: tag, isPublished: true });
};

storySchema.statics.findFeatured = function () {
  return this.find({ featured: true, isPublished: true }).sort({
    featuredOrder: 1,
    updatedAt: -1,
  });
};

storySchema.statics.searchStories = function (query) {
  return this.find(
    {
      $text: { $search: query },
      isPublished: true,
    },
    { score: { $meta: "textScore" } }
  ).sort({ score: { $meta: "textScore" } });
};

export default mongoose.model("Story", storySchema);

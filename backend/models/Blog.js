
import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: 3,
      maxlength: 120,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    excerpt: {
      type: String,
      required: [true, 'Blog excerpt is required'],
      trim: true,
      maxlength: 300,
    },

    content: {
      type: String,
      required: [true, 'Blog content is required'],
      trim: true,
      minlength: 10,
    },

    coverImage: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      default: 'General',
      trim: true,
      maxlength: 50,
    },

    tags: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    readingTime: {
      type: Number,
      default: 1,
    },

    views: {
      type: Number,
      default: 0,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Calculate estimated reading time before validation.
blogSchema.pre('validate', function () {
  const words = this.content
    ? this.content.trim().split(/\s+/).length
    : 0;

  this.readingTime = Math.max(1, Math.ceil(words / 200));
});

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;


import mongoose from 'mongoose';
import Blog from '../models/Blog.js';

// --------------------------------------------------
// SLUG UTILITIES
// --------------------------------------------------

const createSlug = (value) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
};

const generateUniqueSlug = async (title, excludeId = null) => {
  const baseSlug = createSlug(title) || 'blog';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existingBlog = await Blog.findOne(query).select('_id');

    if (!existingBlog) {
      return slug;
    }

    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
};

// --------------------------------------------------
// PAGINATION
// --------------------------------------------------

const getPagination = (req) => {
  const page = Math.max(
    1,
    Number.parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    50,
    Math.max(
      1,
      Number.parseInt(req.query.limit, 10) || 10
    )
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

const handleControllerError = (res, error) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Please check the submitted blog details.',
      errors: Object.values(error.errors).map(
        (item) => item.message
      ),
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'A blog with this URL slug already exists.',
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('Blog controller error:', error);
  } else {
    console.error('Blog controller error:', error.message);
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong while processing the blog.',
  });
};

// --------------------------------------------------
// CREATE BLOG
// POST /api/blogs
// --------------------------------------------------

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
    } = req.body;

    if (!title || !excerpt || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, excerpt, and content are required.',
      });
    }

    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be draft or published.',
      });
    }

    const slug = await generateUniqueSlug(title);
    const blogStatus = status || 'draft';

    const blog = await Blog.create({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || '',
      category: category || 'General',
      tags: Array.isArray(tags) ? tags : [],
      status: blogStatus,
      author: req.user._id,
      publishedAt:
        blogStatus === 'published' ? new Date() : null,
    });

    return res.status(201).json({
      success: true,
      message: 'Blog created successfully.',
      blog,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// --------------------------------------------------
// GET ALL PUBLISHED BLOGS
// GET /api/blogs
// --------------------------------------------------

export const getPublishedBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();

    const filter = {
      status: 'published',
    };

    if (category) {
      filter.category = category;
    }

    if (search) {
      const safeSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
      );

      const searchRegex = new RegExp(safeSearch, 'i');

      filter.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
      ];
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name avatar')
        .select('-content')
        .sort({
          publishedAt: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit)
        .lean(),

      Blog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// --------------------------------------------------
// GET MY BLOGS
// GET /api/blogs/mine
// --------------------------------------------------

export const getMyBlogs = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const status = String(req.query.status || '').trim();

    if (status && !['draft', 'published'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be draft or published.',
      });
    }

    const filter = {
      author: req.user._id,
    };

    if (status) {
      filter.status = status;
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Blog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      blogs,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// --------------------------------------------------
// GET SINGLE PUBLISHED BLOG
// GET /api/blogs/:slug
// --------------------------------------------------

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      {
        slug: req.params.slug,
        status: 'published',
      },
      {
        $inc: { views: 1 },
      },
      {
        new: true,
      }
    ).populate('author', 'name avatar');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Published blog not found.',
      });
    }

    return res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// --------------------------------------------------
// UPDATE BLOG
// PATCH /api/blogs/:id
// Only the owner can update.
// --------------------------------------------------

export const updateBlog = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID.',
      });
    }

    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          'Blog not found or you do not have permission to edit it.',
      });
    }

    const allowedFields = [
      'title',
      'excerpt',
      'content',
      'coverImage',
      'category',
      'tags',
      'status',
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        blog[field] = req.body[field];
      }
    }

    if (blog.status && !['draft', 'published'].includes(blog.status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be draft or published.',
      });
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      blog.slug = await generateUniqueSlug(
        blog.title,
        blog._id
      );
    }

    if (blog.status === 'published' && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }

    if (blog.status === 'draft') {
      blog.publishedAt = null;
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully.',
      blog,
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// --------------------------------------------------
// DELETE BLOG
// DELETE /api/blogs/:id
// Only the owner can delete.
// --------------------------------------------------

export const deleteBlog = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid blog ID.',
      });
    }

    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message:
          'Blog not found or you do not have permission to delete it.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog deleted successfully.',
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

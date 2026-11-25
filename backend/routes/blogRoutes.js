
import express from 'express';

import protect from '../middleware/authMiddleware.js';

import {
  createBlog,
  getPublishedBlogs,
  getMyBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
} from '../controllers/blogController.js';

const router = express.Router();

// Specific routes first
router.get('/mine', protect, getMyBlogs);

// Public routes
router.get('/', getPublishedBlogs);
router.get('/:slug', getBlogBySlug);

// Protected owner routes
router.post('/', protect, createBlog);
router.patch('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

export default router;


import express from 'express';
import { body, validationResult } from 'express-validator';

import {
  registerUser,
  loginUser,
  googleLogin,
} from '../controllers/authController.js';

const router = express.Router();

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  next();
};

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isString()
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters'),
];

const loginValidation = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
];

router.post(
  '/register',
  registerValidation,
  validateRequest,
  registerUser
);

router.post(
  '/login',
  loginValidation,
  validateRequest,
  loginUser
);

router.post('/google', googleLogin);

export default router;

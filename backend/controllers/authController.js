
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

// Generate JWT token
const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

// Format user response
const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  bio: user.bio,
  role: user.role,
  createdAt: user.createdAt,
});

// Register new user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: 'local',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    next(error);
  }
};

// Login existing user
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account is currently inactive',
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message:
          'This account uses Google sign-in. Please continue with Google.',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// Google authentication
export const googleLogin = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required',
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID is not configured');
    }

    // Verify Google ID token on the backend
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (
      !payload ||
      !payload.sub ||
      !payload.email ||
      payload.email_verified !== true
    ) {
      return res.status(401).json({
        success: false,
        message: 'Google account verification failed',
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name?.trim() || email.split('@')[0];
    const avatar = payload.picture || '';

    // IMPORTANT: Explicitly retrieve hidden fields
    let user = await User.findOne({
      $or: [
        { googleId },
        { email },
      ],
    }).select('+googleId +password');

    if (user) {
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'This account is currently inactive',
        });
      }

      // Prevent linking a different Google identity
      if (user.googleId && user.googleId !== googleId) {
        return res.status(409).json({
          success: false,
          message:
            'This email is linked to a different Google account',
        });
      }

      user.googleId = googleId;

      user.authProvider = user.password
        ? 'both'
        : 'google';

      if (!user.avatar && avatar) {
        user.avatar = avatar;
      }

      await user.save();
    } else {
      // Create a new Google-only account
      user = await User.create({
        name,
        email,
        googleId,
        avatar,
        authProvider: 'google',
        role: 'user',
        isActive: true,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Google sign-in successful',
      token,
      user: formatUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          'This Google account is already linked to another user',
      });
    }

    if (
      error.message?.includes('Token used too late') ||
      error.message?.includes('Invalid token')
    ) {
      return res.status(401).json({
        success: false,
        message: 'Google credential is invalid or expired',
      });
    }

    next(error);
  }
};

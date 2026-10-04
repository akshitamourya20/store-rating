const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const memoryDb = require('../services/memoryDb');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_roxiler_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email address already exists.',
        });
      }

      const user = await User.create({
        name,
        email,
        password,
        address,
        role: 'USER',
      });

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
        },
      });
    }

    // In-memory fallback (when MongoDB is not configured)
    const existing = await memoryDb.findUserByEmail(email);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.',
      });
    }

    const newUser = await memoryDb.createUser({
      name,
      email,
      password,
      address,
      role: 'USER',
    });

    const token = generateToken(newUser);
    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: err.message,
    });
  }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password.',
        });
      }

      const token = generateToken(user);

      let storeDetails = null;
      if (user.role === 'STORE_OWNER') {
        const store = await Store.findOne({ ownerId: user._id });
        if (store) {
          storeDetails = {
            id: store._id,
            name: store.name,
            email: store.email,
            address: store.address,
            averageRating: store.averageRating,
            totalRatings: store.totalRatings,
          };
        }
      }

      return res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          store: storeDetails,
        },
      });
    }

    // In-memory fallback
    const user = await memoryDb.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await memoryDb.comparePassword(user, password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user);

    let storeDetails = null;
    if (user.role === 'STORE_OWNER') {
      try {
        const dash = await memoryDb.getStoreOwnerDashboard(user._id, user.email);
        storeDetails = dash.store;
      } catch (e) {}
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role,
        store: storeDetails,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
      error: err.message,
    });
  }
};

// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found.',
        });
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match our records.',
        });
      }

      user.password = newPassword;
      await user.save();

      return res.json({
        success: true,
        message: 'Password updated successfully.',
      });
    }

    // In-memory fallback
    const user = await memoryDb.findUserById(req.user._id || req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    const isMatch = await memoryDb.comparePassword(user, currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match our records.',
      });
    }

    await memoryDb.updatePassword(user._id, newPassword);

    return res.json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during password update.',
      error: err.message,
    });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user._id).select('-password');
      let storeDetails = null;

      if (user.role === 'STORE_OWNER') {
        const store = await Store.findOne({ ownerId: user._id });
        if (store) {
          storeDetails = {
            id: store._id,
            name: store.name,
            email: store.email,
            address: store.address,
            averageRating: store.averageRating,
            totalRatings: store.totalRatings,
          };
        }
      }

      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
          store: storeDetails,
        },
      });
    }

    // In-memory fallback
    return res.json({
      success: true,
      user: {
        id: req.user._id || req.user.id,
        name: req.user.name,
        email: req.user.email,
        address: req.user.address,
        role: req.user.role,
        store: req.user.store || null,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile.',
    });
  }
};

module.exports = {
  signup,
  login,
  changePassword,
  getMe,
};

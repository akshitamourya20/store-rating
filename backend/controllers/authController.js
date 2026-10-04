const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Store = require('../models/Store');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_roxiler_2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/signup
// @desc    Register a new normal user
// @access  Public
const signup = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

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

    res.status(201).json({
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
// @desc    Single login endpoint for all users (Admin, Normal User, Store Owner)
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

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

    res.json({
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
// @desc    Change password after logging in (for all authenticated users)
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

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

    res.json({
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
// @desc    Get current user profile
// @access  Private
const getMe = async (req, res) => {
  try {
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

    res.json({
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

const mongoose = require('mongoose');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const memoryDb = require('../services/memoryDb');

// @route   GET /api/admin/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [totalUsers, totalStores, totalRatings] = await Promise.all([
        User.countDocuments(),
        Store.countDocuments(),
        Rating.countDocuments(),
      ]);

      return res.json({
        success: true,
        stats: {
          totalUsers,
          totalStores,
          totalRatings,
        },
      });
    }

    // In-memory fallback
    const stats = await memoryDb.getStats();
    return res.json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard metrics.',
      error: err.message,
    });
  }
};

// @route   POST /api/admin/users
const addUser = async (req, res) => {
  try {
    const { name, email, password, address, role } = req.body;
    const allowedRoles = ['ADMIN', 'USER', 'STORE_OWNER'];
    const assignedRole = allowedRoles.includes(role) ? role : 'USER';

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
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
        role: assignedRole,
      });

      return res.status(201).json({
        success: true,
        message: `User created successfully with role ${assignedRole}.`,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          address: user.address,
          role: user.role,
        },
      });
    }

    // In-memory fallback
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
      role: assignedRole,
    });

    return res.status(201).json({
      success: true,
      message: `User created successfully with role ${assignedRole}.`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        address: newUser.address,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Error adding user by admin:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create user.',
      error: err.message,
    });
  }
};

// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const { name, email, address, role, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (email) filter.email = { $regex: email, $options: 'i' };
      if (address) filter.address = { $regex: address, $options: 'i' };
      if (role && role !== 'ALL') filter.role = role;

      const sort = {};
      const validSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sort[field] = sortOrder === 'asc' ? 1 : -1;

      const users = await User.find(filter).sort(sort).select('-password');

      const storeOwners = users.filter((u) => u.role === 'STORE_OWNER');
      const storeOwnerIds = storeOwners.map((u) => u._id);
      const stores = await Store.find({ ownerId: { $in: storeOwnerIds } });

      const storeMap = {};
      stores.forEach((store) => {
        storeMap[store.ownerId.toString()] = {
          storeId: store._id,
          storeName: store.name,
          averageRating: store.averageRating,
          totalRatings: store.totalRatings,
        };
      });

      const enrichedUsers = users.map((user) => {
        const userObj = user.toObject();
        if (user.role === 'STORE_OWNER' && storeMap[user._id.toString()]) {
          userObj.store = storeMap[user._id.toString()];
          userObj.storeRating = storeMap[user._id.toString()].averageRating;
        } else {
          userObj.store = null;
          userObj.storeRating = null;
        }
        return userObj;
      });

      return res.json({
        success: true,
        count: enrichedUsers.length,
        users: enrichedUsers,
      });
    }

    // In-memory fallback
    const users = await memoryDb.getUsers({ name, email, address, role, sortBy, sortOrder });
    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users list.',
      error: err.message,
    });
  }
};

// @route   POST /api/admin/stores
const addStore = async (req, res) => {
  try {
    const { name, email, address, ownerId } = req.body;

    if (mongoose.connection.readyState === 1) {
      const existingStore = await Store.findOne({
        $or: [{ email: email.toLowerCase().trim() }, { name: name.trim() }],
      });

      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'A store with this name or email already exists.',
        });
      }

      let assignedOwnerId = null;
      if (ownerId) {
        const ownerUser = await User.findById(ownerId);
        if (ownerUser) {
          assignedOwnerId = ownerUser._id;
        }
      }

      const store = await Store.create({
        name,
        email,
        address,
        ownerId: assignedOwnerId,
      });

      if (assignedOwnerId) {
        await User.findByIdAndUpdate(assignedOwnerId, {
          role: 'STORE_OWNER',
          storeId: store._id,
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Store created successfully.',
        store,
      });
    }

    // In-memory fallback
    const newStore = await memoryDb.createStore({ name, email, address, ownerId });
    return res.status(201).json({
      success: true,
      message: 'Store created successfully.',
      store: newStore,
    });
  } catch (err) {
    console.error('Error adding store:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create store.',
      error: err.message,
    });
  }
};

// @route   GET /api/admin/stores
const getStores = async (req, res) => {
  try {
    const { name, email, address, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (name) filter.name = { $regex: name, $options: 'i' };
      if (email) filter.email = { $regex: email, $options: 'i' };
      if (address) filter.address = { $regex: address, $options: 'i' };

      const sort = {};
      const validSortFields = ['name', 'email', 'address', 'averageRating', 'totalRatings', 'createdAt'];
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sort[field] = sortOrder === 'asc' ? 1 : -1;

      const stores = await Store.find(filter)
        .populate('ownerId', 'name email')
        .sort(sort);

      return res.json({
        success: true,
        count: stores.length,
        stores,
      });
    }

    // In-memory fallback
    const stores = await memoryDb.getStores({ name, email, address, sortBy, sortOrder });
    return res.json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (err) {
    console.error('Error fetching stores for admin:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores list.',
      error: err.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  addUser,
  getUsers,
  addStore,
  getStores,
};

const mongoose = require('mongoose');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const memoryDb = require('../services/memoryDb');

// @route   GET /api/stores
const getStoresForUser = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (mongoose.connection.readyState === 1) {
      const filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } },
        ];
      }

      const sort = {};
      const validSortFields = ['name', 'address', 'averageRating', 'totalRatings', 'createdAt'];
      const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
      sort[field] = sortOrder === 'asc' ? 1 : -1;

      const stores = await Store.find(filter).sort(sort);

      const userRatings = await Rating.find({ userId: req.user._id });
      const userRatingMap = {};
      userRatings.forEach((r) => {
        userRatingMap[r.storeId.toString()] = {
          ratingId: r._id,
          rating: r.rating,
          updatedAt: r.updatedAt,
        };
      });

      const enrichedStores = stores.map((store) => {
        const storeObj = store.toObject();
        storeObj.myRating = userRatingMap[store._id.toString()] || null;
        return storeObj;
      });

      return res.json({
        success: true,
        count: enrichedStores.length,
        stores: enrichedStores,
      });
    }

    // In-memory fallback
    const stores = await memoryDb.getStoresForUser({
      userId: req.user._id || req.user.id,
      search,
      sortBy,
      sortOrder,
    });

    return res.json({
      success: true,
      count: stores.length,
      stores,
    });
  } catch (err) {
    console.error('Error fetching stores for user:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stores.',
      error: err.message,
    });
  }
};

// @route   GET /api/stores/owner/dashboard
const getStoreOwnerDashboard = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      let store = await Store.findOne({ ownerId: req.user._id });
      if (!store) {
        store = await Store.findOne({ email: req.user.email });
      }

      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'No store found associated with your store owner account.',
        });
      }

      const ratings = await Rating.find({ storeId: store._id })
        .populate('userId', 'name email address')
        .sort({ updatedAt: -1 });

      const ratersList = ratings.map((r) => ({
        ratingId: r._id,
        rating: r.rating,
        ratedAt: r.updatedAt,
        user: r.userId
          ? {
              id: r.userId._id,
              name: r.userId.name,
              email: r.userId.email,
              address: r.userId.address,
            }
          : { name: 'Anonymous User', email: 'N/A', address: 'N/A' },
      }));

      return res.json({
        success: true,
        store: {
          id: store._id,
          name: store.name,
          email: store.email,
          address: store.address,
          averageRating: store.averageRating,
          totalRatings: store.totalRatings,
        },
        ratings: ratersList,
      });
    }

    // In-memory fallback
    const data = await memoryDb.getStoreOwnerDashboard(
      req.user._id || req.user.id,
      req.user.email
    );

    return res.json({
      success: true,
      store: data.store,
      ratings: data.ratings,
    });
  } catch (err) {
    console.error('Error fetching store owner dashboard:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to load store owner dashboard.',
      error: err.message,
    });
  }
};

module.exports = {
  getStoresForUser,
  getStoreOwnerDashboard,
};

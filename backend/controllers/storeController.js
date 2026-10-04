const Store = require('../models/Store');
const Rating = require('../models/Rating');

// @route   GET /api/stores
// @desc    Get all stores for normal users with search (Name & Address), sorting, and the logged-in user's rating
// @access  Private (Authenticated users)
const getStoresForUser = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

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

    // Fetch this user's submitted ratings for all stores
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

    res.json({
      success: true,
      count: enrichedStores.length,
      stores: enrichedStores,
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
// @desc    Store Owner dashboard: Average rating and list of users who rated the store
// @access  Private (Store Owner only)
const getStoreOwnerDashboard = async (req, res) => {
  try {
    // Find store owned by this user
    let store = await Store.findOne({ ownerId: req.user._id });
    if (!store) {
      // If store is not directly linked via ownerId, try finding by email match or return empty
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

    res.json({
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
  } catch (err) {
    console.error('Error fetching store owner dashboard:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to load store owner dashboard.',
      error: err.message,
    });
  }
};

module.exports = {
  getStoresForUser,
  getStoreOwnerDashboard,
};

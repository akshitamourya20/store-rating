const mongoose = require('mongoose');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const memoryDb = require('../services/memoryDb');

// @route   POST /api/ratings
const submitOrUpdateRating = async (req, res) => {
  try {
    const { storeId, rating } = req.body;
    const userId = req.user._id || req.user.id;

    if (!storeId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: 'storeId and rating are required.',
      });
    }

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    if (mongoose.connection.readyState === 1) {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      let existingRating = await Rating.findOne({ userId, storeId });
      let isModified = false;

      if (existingRating) {
        existingRating.rating = ratingNum;
        await existingRating.save();
        isModified = true;
      } else {
        existingRating = await Rating.create({
          userId,
          storeId,
          rating: ratingNum,
        });
      }

      await Rating.calculateAverageRating(storeId);
      const updatedStore = await Store.findById(storeId);

      return res.status(200).json({
        success: true,
        message: isModified
          ? 'Your rating has been successfully updated!'
          : 'Thank you! Your rating has been submitted.',
        rating: {
          id: existingRating._id,
          rating: existingRating.rating,
          storeId: existingRating.storeId,
          updatedAt: existingRating.updatedAt,
        },
        store: {
          id: updatedStore._id,
          averageRating: updatedStore.averageRating,
          totalRatings: updatedStore.totalRatings,
        },
      });
    }

    // In-memory fallback
    const result = await memoryDb.submitOrUpdateRating({
      userId,
      storeId,
      rating: ratingNum,
    });

    return res.status(200).json({
      success: true,
      message: result.isModified
        ? 'Your rating has been successfully updated!'
        : 'Thank you! Your rating has been submitted.',
      rating: result.rating,
      store: result.store,
    });
  } catch (err) {
    console.error('Error submitting/modifying rating:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to submit or modify rating.',
      error: err.message,
    });
  }
};

module.exports = {
  submitOrUpdateRating,
};

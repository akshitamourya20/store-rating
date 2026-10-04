const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating value is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer between 1 and 5',
      },
    },
  },
  {
    timestamps: true,
  }
);

// One rating per user per store
ratingSchema.index({ userId: 1, storeId: 1 }, { unique: true });

// Static helper to recalculate store average rating
ratingSchema.statics.calculateAverageRating = async function (storeId) {
  const stats = await this.aggregate([
    { $match: { storeId: new mongoose.Types.ObjectId(storeId) } },
    {
      $group: {
        _id: '$storeId',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  const Store = mongoose.model('Store');
  if (stats.length > 0) {
    const avg = Math.round(stats[0].averageRating * 10) / 10; // 1 decimal place
    await Store.findByIdAndUpdate(storeId, {
      averageRating: avg,
      totalRatings: stats[0].totalRatings,
    });
  } else {
    await Store.findByIdAndUpdate(storeId, {
      averageRating: 0,
      totalRatings: 0,
    });
  }
};

// Post-save hook
ratingSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.storeId);
});

// Post-remove / findOneAndDelete hook
ratingSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.storeId);
  }
});

module.exports = mongoose.model('Rating', ratingSchema);

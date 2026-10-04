const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      minlength: [3, 'Store name must be at least 3 characters'],
      maxlength: [60, 'Store name must not exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Store email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid store email address',
      ],
    },
    address: {
      type: String,
      required: [true, 'Store address is required'],
      maxlength: [400, 'Address must not exceed 400 characters'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

storeSchema.index({ name: 'text', address: 'text' });

module.exports = mongoose.model('Store', storeSchema);

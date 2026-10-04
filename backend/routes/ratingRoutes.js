const express = require('express');
const router = express.Router();
const { submitOrUpdateRating } = require('../controllers/ratingController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  ratingValidationRules,
  handleValidationErrors,
} = require('../middleware/validationMiddleware');

router.post(
  '/',
  verifyToken,
  ratingValidationRules,
  handleValidationErrors,
  submitOrUpdateRating
);

module.exports = router;

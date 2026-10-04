const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  changePassword,
  getMe,
} = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const {
  userValidationRules,
  changePasswordValidationRules,
  handleValidationErrors,
} = require('../middleware/validationMiddleware');

router.post('/signup', userValidationRules, handleValidationErrors, signup);
router.post('/login', login);
router.put(
  '/change-password',
  verifyToken,
  changePasswordValidationRules,
  handleValidationErrors,
  changePassword
);
router.get('/me', verifyToken, getMe);

module.exports = router;

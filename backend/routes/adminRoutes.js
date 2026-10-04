const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  addUser,
  getUsers,
  addStore,
  getStores,
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');
const {
  userValidationRules,
  storeValidationRules,
  handleValidationErrors,
} = require('../middleware/validationMiddleware');

// All admin routes require ADMIN role
router.use(verifyToken, authorizeRoles('ADMIN'));

router.get('/dashboard-stats', getDashboardStats);
router.post('/users', userValidationRules, handleValidationErrors, addUser);
router.get('/users', getUsers);
router.post('/stores', storeValidationRules, handleValidationErrors, addStore);
router.get('/stores', getStores);

module.exports = router;

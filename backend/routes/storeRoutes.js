const express = require('express');
const router = express.Router();
const {
  getStoresForUser,
  getStoreOwnerDashboard,
} = require('../controllers/storeController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', verifyToken, getStoresForUser);
router.get('/owner/dashboard', verifyToken, authorizeRoles('STORE_OWNER'), getStoreOwnerDashboard);

module.exports = router;

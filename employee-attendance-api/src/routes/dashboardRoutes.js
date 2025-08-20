const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET: /api/dashboard/stats - Lấy thống kê dashboard
router.get('/stats', dashboardController.getDashboardStats);

// GET: /api/notifications - Lấy thông báo
router.get('/notifications', dashboardController.getNotifications);

module.exports = router;

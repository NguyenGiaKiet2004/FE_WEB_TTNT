const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { requireAuth, requireRoles } = require('../middleware/auth');

// GET: /api/dashboard/stats - Lấy thống kê dashboard
router.get('/stats', requireAuth, requireRoles(['super_admin','hr_manager']), dashboardController.getDashboardStats);

// GET: /api/notifications - Lấy thông báo
router.get('/notifications', requireAuth, requireRoles(['super_admin','hr_manager']), dashboardController.getNotifications);

module.exports = router;

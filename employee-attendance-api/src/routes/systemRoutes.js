const express = require('express');
const router = express.Router();
const systemController = require('../controllers/systemController');
const { requireAdminAccess, requireAuth, requireRoles } = require('../middleware/auth');

// GET: /api/system/configs - Lấy tất cả cấu hình hệ thống
router.get('/configs', requireAuth, requireRoles(['super_admin','hr_manager']), systemController.getSystemConfigs);

// PUT: /api/system/configs/:key - Cập nhật cấu hình
router.put('/configs/:key', requireAdminAccess, systemController.updateSystemConfig);

// POST: /api/system/configs/initialize - Khởi tạo cấu hình mặc định
router.post('/configs/initialize', requireAdminAccess, systemController.initializeSystemConfigs);

// GET: /api/system/configs/test - Test route
router.get('/configs/test', systemController.testSystemConfigs);

module.exports = router;

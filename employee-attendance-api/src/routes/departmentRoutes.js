const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { requireAdminAccess, requireAuth } = require('../middleware/auth');

// GET: /api/departments - Lấy tất cả phòng ban (public cho trang đăng ký)
router.get('/', departmentController.getAllDepartments);

// POST: /api/departments - Tạo phòng ban 
router.post('/', requireAdminAccess, departmentController.createDepartment);

// PUT: /api/departments/:id - Cập nhật phòng ban 
router.put('/:id', requireAdminAccess, departmentController.updateDepartment);

// DELETE: /api/departments/:id - Xóa phòng ban 
router.delete('/:id', requireAdminAccess, departmentController.deleteDepartment);

module.exports = router;

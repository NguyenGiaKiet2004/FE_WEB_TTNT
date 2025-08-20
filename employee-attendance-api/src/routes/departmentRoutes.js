const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { requireAdminAccess } = require('../middleware/auth');

// GET: /api/departments - Lấy tất cả phòng ban
router.get('/', departmentController.getAllDepartments);

// POST: /api/departments - Tạo phòng ban (Admin only)
router.post('/', requireAdminAccess, departmentController.createDepartment);

// PUT: /api/departments/:id - Cập nhật phòng ban (Admin only)
router.put('/:id', requireAdminAccess, departmentController.updateDepartment);

// DELETE: /api/departments/:id - Xóa phòng ban (Admin only)
router.delete('/:id', requireAdminAccess, departmentController.deleteDepartment);

module.exports = router;

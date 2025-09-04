const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { requireAdminAccess, requireAuth } = require('../middleware/auth');

// GET: /api/employees - Lấy tất cả nhân viên
router.get('/', requireAuth, employeeController.getAllEmployees);

// GET: /api/employees/:id - Lấy thông tin 1 nhân viên
router.get('/:id', requireAuth, employeeController.getEmployeeById);

// POST: /api/employees - Tạo nhân viên (Admin only)
router.post('/', requireAdminAccess, employeeController.createEmployee);

// PUT: /api/employees/:id - Cập nhật nhân viên (Admin only)
router.put('/:id', requireAdminAccess, employeeController.updateEmployee);

// DELETE: /api/employees/:id - Xóa nhân viên (Admin only)
router.delete('/:id', requireAdminAccess, employeeController.deleteEmployee);

module.exports = router;

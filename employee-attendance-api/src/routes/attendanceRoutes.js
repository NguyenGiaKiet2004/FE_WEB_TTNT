const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { requireAuth, requireRoles } = require('../middleware/auth');

// GET: /api/attendance - Lấy danh sách bản ghi chấm công
router.get('/', requireAuth, requireRoles(['super_admin','hr_manager']), attendanceController.getAttendanceRecords);

// GET: /api/attendance/series - Lấy dữ liệu chuỗi thời gian chấm công để vẽ biểu đồ
router.get('/series', requireAuth, requireRoles(['super_admin','hr_manager']), attendanceController.getAttendanceSeries);

// GET: /api/attendance/detail/:id - Lấy thông tin chi tiết bản ghi chấm công
router.get('/detail/:id', requireAuth, attendanceController.getAttendanceDetail);

// POST: /api/attendance - Tạo bản ghi chấm công
router.post('/', requireAuth, requireRoles(['super_admin','hr_manager']), attendanceController.createAttendanceRecord);

// PUT: /api/attendance/:id - Cập nhật bản ghi chấm công
router.put('/:id', requireAuth, requireRoles(['super_admin','hr_manager']), attendanceController.updateAttendanceRecord);

module.exports = router;

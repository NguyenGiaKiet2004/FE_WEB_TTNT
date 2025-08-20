const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// GET: /api/attendance - Lấy danh sách bản ghi chấm công
router.get('/', attendanceController.getAttendanceRecords);

// GET: /api/attendance/series - Lấy dữ liệu chuỗi thời gian chấm công để vẽ biểu đồ
router.get('/series', attendanceController.getAttendanceSeries);

// GET: /api/attendance/detail/:id - Lấy thông tin chi tiết bản ghi chấm công
router.get('/detail/:id', attendanceController.getAttendanceDetail);

// POST: /api/attendance - Tạo bản ghi chấm công
router.post('/', attendanceController.createAttendanceRecord);

// PUT: /api/attendance/:id - Cập nhật bản ghi chấm công
router.put('/:id', attendanceController.updateAttendanceRecord);

module.exports = router;

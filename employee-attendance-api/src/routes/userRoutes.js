const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route để tạo nhân viên mới
router.post('/', userController.createUser);

// Route để lấy danh sách tất cả nhân viên
router.get('/', userController.getAllUsers);

// Route để lấy thông tin một nhân viên cụ thể
router.get('/:id', userController.getUserById);

// Route để cập nhật thông tin nhân viên
router.put('/:id', userController.updateUser);

// Route để xóa nhân viên
router.delete('/:id', userController.deleteUser);

module.exports = router;
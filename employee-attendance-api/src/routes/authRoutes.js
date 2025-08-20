// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Endpoint đăng ký
router.post('/register', authController.registerUser);

// Endpoint đăng nhập
router.post('/login', authController.loginUser);

// Endpoint lấy thông tin người dùng hiện tại
router.get('/me', authController.getCurrentUser);

module.exports = router;
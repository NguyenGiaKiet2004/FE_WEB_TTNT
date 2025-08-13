// src/services/userService.js
const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Logic đăng ký người dùng
exports.register = async (full_name, email, password, role, department_id) => {
  const existingUser = await userModel.findByEmail(email);
  if (existingUser) {
    // Ném lỗi để controller có thể bắt và xử lý
    throw new Error("Email đã tồn tại");
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);
  const newUserId = await userModel.create(full_name, email, password_hash, role, department_id);
  return newUserId;
};

// Logic đăng nhập
exports.login = async (email, password) => {
  const user = await userModel.findByEmail(email);
  if (!user) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Email hoặc mật khẩu không đúng");
  }

  const payload = {
    userId: user.user_id,
    role: user.role,
    email: user.email
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

  return { token, user: { userId: user.user_id, fullName: user.full_name, role: user.role } };
};

// Logic lấy danh sách nhân viên
exports.getAllUsers = async () => {
  return await userModel.getAll();
};
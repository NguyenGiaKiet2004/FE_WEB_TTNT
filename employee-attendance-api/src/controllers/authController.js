const pool = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// [POST] /api/auth/register
exports.registerUser = async (req, res) => {
  const { full_name, email, password, role, department_id } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin" });
  }

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "Email đã tồn tại" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const userId = await userModel.create(full_name, email, password_hash, role, department_id);

    res.status(201).json({
      message: "Đăng ký người dùng thành công",
      userId: userId
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký người dùng:', error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng ký người dùng",
      error: error.message
    });
  }
};

// [POST] /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Vui lòng nhập email và mật khẩu" });
  }

  try {
    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const payload = {
      userId: user.user_id,
      role: user.role,
      email: user.email
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi đăng nhập",
      error: error.message
    });
  }
};
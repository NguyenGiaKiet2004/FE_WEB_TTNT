const pool = require('../utils/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// POST: /api/auth/register
exports.registerUser = async (req, res) => {
  // Chấp nhận cả camelCase và snake_case từ frontend
  const full_name = (req.body.full_name || req.body.fullName || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';
  const role = (req.body.role || 'employee').trim();
  let department_id = req.body.department_id ?? req.body.departmentId ?? null;
  if (department_id === '' || department_id === undefined) department_id = null;
  if (department_id !== null) {
    const parsed = parseInt(department_id, 10);
    department_id = Number.isNaN(parsed) ? null : parsed;
  }

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

// POST: /api/auth/login
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
        email: user.email,
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

// GET: /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    console.log('🔐 /api/auth/me Debug:', { 
      hasAuthHeader: !!authHeader, 
      hasToken: !!token,
      headers: req.headers 
    });
    
    if (!token) {
      return res.status(401).json({ authenticated: false, message: 'Missing token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      `SELECT u.*, d.department_name FROM Users u LEFT JOIN Departments d ON u.department_id = d.department_id WHERE u.user_id = ?`,
      [payload.userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ authenticated: false, message: 'User not found' });
    }

    const user = rows[0];
    return res.json({
      authenticated: true,
      user: {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        departmentId: user.department_id,
        departmentName: user.department_name,
        phoneNumber: user.phone_number,
        createdAt: user.created_at,
      },
    });
  } catch (err) {
    return res.status(401).json({ authenticated: false, message: 'Invalid or expired token' });
  }
};
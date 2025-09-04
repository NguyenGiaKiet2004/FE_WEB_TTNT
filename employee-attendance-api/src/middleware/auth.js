const pool = require('../utils/db');
const jwt = require('jsonwebtoken');

// Middleware: yêu cầu JWT hợp lệ -> gắn req.user
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.slice(7);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const [rows] = await pool.query(
      'SELECT user_id, email, role, department_id FROM Users WHERE user_id = ? LIMIT 1',
      [payload.userId]
    );
    if (!rows || rows.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = {
      userId: rows[0].user_id,
      email: rows[0].email,
      role: rows[0].role,
      departmentId: rows[0].department_id,
    };
    next();
  } catch (err) {
    console.error('❌ Auth error:', err);
    return res.status(500).json({ message: 'Authorization failed', error: err.message });
  }
};

// Middleware: yêu cầu role thuộc danh sách allowed
const requireRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
};

// Shortcut cho admin (super_admin hoặc hr_manager)
const requireAdminAccess = [requireAuth, requireRoles(['super_admin', 'hr_manager'])];

module.exports = {
  requireAuth,
  requireRoles,
  requireAdminAccess,
};

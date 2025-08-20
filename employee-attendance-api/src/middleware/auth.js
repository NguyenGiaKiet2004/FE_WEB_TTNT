const pool = require('../utils/db');

// Middleware kiểm tra quyền super admin hoặc hr manager
const requireAdminAccess = async (req, res, next) => {
  try {
    // Lấy JWT token từ header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.substring(7); // Xóa prefix 'Bearer '
    
    // Hiện tại, tui sẽ sử dụng phương pháp đơn giản
    // chỉ giải pháp tạm thời nha
    const userId = req.headers['user-id'] || req.query.userId;
    
    console.log('🔐 Auth check - User ID:', userId, 'Headers:', req.headers);
    console.log('🔐 Token:', token ? 'Present' : 'Missing');
    console.log('🔐 User ID from header:', req.headers['user-id']);
    console.log('🔐 User ID from query:', req.query.userId);
    console.log('🔐 Full request body:', req.body);
    console.log('🔐 Full request headers:', JSON.stringify(req.headers, null, 2));
    
    if (!userId) {
      return res.status(401).json({ message: 'User ID required' });
    }

    const [rows] = await pool.query(
      'SELECT role FROM Users WHERE user_id = ?',
      [userId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userRole = rows[0].role;
    console.log('🔐 User role:', userRole);

    // Cho phép super_admin và hr_manager
    if (!['super_admin', 'hr_manager'].includes(userRole)) {
      return res.status(403).json({ message: 'Admin access required (Super Admin or HR Manager)' });
    }

    console.log('✅ Auth successful for role:', userRole);
    next();
  } catch (err) {
    console.error('❌ Auth error:', err);
    return res.status(500).json({ message: 'Authorization failed', error: err.message });
  }
};

module.exports = {
  requireAdminAccess
};

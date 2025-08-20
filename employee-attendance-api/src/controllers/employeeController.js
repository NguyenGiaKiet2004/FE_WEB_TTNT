const pool = require('../utils/db');
const bcrypt = require('bcryptjs');

// [GET] /api/employees - Get all nhân viên
exports.getAllEmployees = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '10', 10)));
    const offset = (page - 1) * limit;

    // Get tổng số lượng
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM Users WHERE role != "super_admin"'
    );

    // Get data phân trang
    const [rows] = await pool.query(`
      SELECT u.user_id, u.full_name, u.email, u.role, u.phone_number, u.department_id, d.department_name
      FROM Users u
      LEFT JOIN Departments d ON u.department_id = d.department_id
      WHERE u.role != 'super_admin'
      ORDER BY u.full_name
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const employees = rows.map((u) => ({
      id: u.user_id,
      name: u.full_name,
      fullName: u.full_name, // for Dashboard.jsx which expects fullName
      email: u.email,
      employeeId: String(u.user_id),
      department: u.department_name ? { name: u.department_name } : null,
      role: u.role ? { id: u.role === 'hr_manager' ? 1 : 2, name: u.role } : null,
      status: 'active',
      faceImages: [],
      phoneNumber: u.phone_number,
    }));

    const totalPages = Math.ceil(total / limit);
    
    return res.json({
      employees,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch employees', error: err.message });
  }
};

// [GET] /api/employees/:id - Get thông tin 1 NV
exports.getEmployeeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.phone_number, u.department_id, d.department_name
       FROM Users u
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE u.user_id = ? AND u.role != 'super_admin'
       LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const u = rows[0];
    const mapped = {
      id: u.user_id,
      name: u.full_name,
      fullName: u.full_name,
      email: u.email,
      employeeId: String(u.user_id),
      department: u.department_name ? { name: u.department_name } : null,
      role: u.role ? { id: u.role === 'hr_manager' ? 1 : 2, name: u.role } : null,
      status: 'active',
      faceImages: [],
      phoneNumber: u.phone_number,
    };

    return res.json(mapped);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch employee', error: err.message });
  }
};

// [POST] /api/employees - Create new employee
exports.createEmployee = async (req, res) => {
  try {
    console.log('🎯 POST /api/employees called');
    console.log('🎯 Request headers:', req.headers);
    console.log('🎯 Request body:', req.body);
    
    const { name, email, password, phoneNumber, departmentId, roleId, status = 'active' } = req.body;
    
    if (!name || !email || !password || !departmentId || !roleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check email đã tồn tại
    const [[existingUser]] = await pool.query(
      'SELECT user_id FROM Users WHERE email = ?',
      [email]
    );
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Get department_id từ tên PB
    let department_id = null;
    if (departmentId) {
      console.log('🔧 Looking for department:', departmentId);
      
      // Ưu tiên tìm kiếm khớp chính xác trước
      let [[dept]] = await pool.query(
        'SELECT department_id FROM Departments WHERE department_name = ?',
        [departmentId]
      );
      
      // Nếu không tìm thấy, thử khớp không phân biệt chữ hoa/thường
      if (!dept) {
        console.log('🔧 Exact match not found, trying case-insensitive...');
        [dept] = await pool.query(
          'SELECT department_id FROM Departments WHERE LOWER(department_name) = LOWER(?)',
          [departmentId.trim()]
        );
      }
      
      // Nếu vẫn không tìm thấy, thử khớp sau khi loại bỏ khoảng trắng
      if (!dept) {
        console.log('🔧 Case-insensitive match not found, trying trimmed...');
        [dept] = await pool.query(
          'SELECT department_id FROM Departments WHERE LOWER(TRIM(department_name)) = LOWER(TRIM(?))',
          [departmentId]
        );
      }
      
      console.log('🔧 Found department:', dept);
      
      if (!dept) {
        console.log('❌ Department not found:', departmentId);
        return res.status(400).json({ 
          message: `Department '${departmentId}' not found. Available departments: ${(await pool.query('SELECT department_name FROM Departments')).map(d => d.department_name).join(', ')}` 
        });
      }
      
      department_id = dept.department_id;
    }
    
    console.log('🔧 Final department_id:', department_id);

    // Xác thực vai trò
    const validRoles = ['hr_manager', 'employee'];
    if (!validRoles.includes(roleId)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    
    // Thêm người dùng mới (user_id sẽ được MySQL tự động tạo)
    const [result] = await pool.query(
      `INSERT INTO Users (full_name, email, phone_number, department_id, role, password_hash, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phoneNumber || null, department_id, roleId, password_hash]
    );

    const newUserId = result.insertId;
    console.log('🔧 New employee created with ID:', newUserId);
    
    // Truy xuất người dùng đã tạo kèm thông tin phòng ban
    const [newUser] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.phone_number, u.department_id, d.department_name
       FROM Users u
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE u.user_id = ?`,
      [newUserId]
    );

    const mapped = newUser.map((u) => ({
      id: u.user_id,
      name: u.full_name,
      fullName: u.full_name,
      email: u.email,
      employeeId: String(u.user_id), // Auto-generated ID
      department: u.department_name ? { name: u.department_name } : null,
      role: u.role ? { id: u.role === 'hr_manager' ? 1 : 2, name: u.role } : null,
      status: status,
      faceImages: [],
      phoneNumber: u.phone_number,
    }));

    return res.status(201).json(mapped[0]);
  } catch (err) {
    console.error('❌ Create Employee Error:', err);
    return res.status(500).json({ message: 'Failed to create employee', error: err.message });
  }
};

// PUT: /api/employees/:id - Update employee
exports.updateEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    const { name, email, phoneNumber, departmentId, roleId, status, employeeId } = req.body;
    
    console.log('🔧 Update Employee - ID:', id);
    console.log('🔧 Update Employee - Data:', { name, email, phoneNumber, departmentId, roleId, status, employeeId });
    
    // Không cho phép thay đổi mã nhân viên
    if (employeeId && parseInt(employeeId) !== id) {
      return res.status(400).json({ message: 'Employee ID cannot be changed' });
    }
    
    if (!name || !email || !departmentId || !roleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Kiểm tra xem email đã tồn tại cho người dùng khác chưa
    const [[existingUser]] = await pool.query(
      'SELECT user_id FROM Users WHERE email = ? AND user_id != ?',
      [email, id]
    );
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Truy xuất mã phòng ban từ tên phòng ban
    let department_id = null;
    if (departmentId) {
      console.log('🔧 Looking for department:', departmentId);
      
      // Ưu tiên tìm kiếm khớp chính xác trước
      let [[dept]] = await pool.query(
        'SELECT department_id FROM Departments WHERE department_name = ?',
        [departmentId]
      );
      
      // Nếu không tìm thấy, thử khớp không phân biệt chữ hoa/thường
      if (!dept) {
        console.log('🔧 Exact match not found, trying case-insensitive...');
        [dept] = await pool.query(
          'SELECT department_id FROM Departments WHERE LOWER(department_name) = LOWER(?)',
          [departmentId.trim()]
        );
      }
      
      // Nếu vẫn không tìm thấy, thử khớp sau khi loại bỏ khoảng trắng
      if (!dept) {
        console.log('🔧 Case-insensitive match not found, trying trimmed...');
        [dept] = await pool.query(
          'SELECT department_id FROM Departments WHERE LOWER(TRIM(department_name)) = LOWER(TRIM(?))',
          [departmentId]
        );
      }
      
      console.log('🔧 Found department:', dept);
      
      if (!dept) {
        console.log('❌ Department not found:', departmentId);
        return res.status(400).json({ 
          message: `Department '${departmentId}' not found. Available departments: ${(await pool.query('SELECT department_name FROM Departments')).map(d => d.department_name).join(', ')}` 
        });
      }
      
      department_id = dept.department_id;
    }
    
    console.log('🔧 Final department_id:', department_id);

    // Xác thực vai trò
    const validRoles = ['hr_manager', 'employee'];
    if (!validRoles.includes(roleId)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Cập nhật người dùng (user_id không thay đổi)
    await pool.query(
      `UPDATE Users 
       SET full_name = ?, email = ?, phone_number = ?, department_id = ?, role = ?
       WHERE user_id = ?`,
      [name, email, phoneNumber || null, department_id, roleId, id]
    );

    // Lấy người dùng đã cập nhật
    const [updatedUser] = await pool.query(
      `SELECT u.user_id, u.full_name, u.email, u.role, u.phone_number, u.department_id, d.department_name
       FROM Users u
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE u.user_id = ?`,
      [id]
    );

    if (!updatedUser || updatedUser.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const mapped = updatedUser.map((u) => ({
      id: u.user_id,
      name: u.full_name,
      fullName: u.full_name,
      email: u.email,
      employeeId: String(u.user_id), // Keep original ID
      department: u.department_name ? { name: u.department_name } : null,
      role: u.role ? { id: u.role === 'hr_manager' ? 1 : 2, name: u.role } : null,
      status: status || 'active',
      faceImages: [],
      phoneNumber: u.phone_number,
    }));

    return res.json(mapped[0]);
  } catch (err) {
    console.error('❌ Update Employee Error:', err);
    return res.status(500).json({ message: 'Failed to update employee', error: err.message });
  }
};

// DELETE: /api/employees/:id - Delete employee
exports.deleteEmployee = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid employee id' });
    }

    // Kiểm tra xem nhân viên có tồn tại không (super_admin sẽ lọc và không có trong danh sách)
    const [[existingUser]] = await pool.query(
      'SELECT user_id, full_name FROM Users WHERE user_id = ? AND role != "super_admin"',
      [id]
    );
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    console.log(`🗑️ Deleting employee: ${existingUser.full_name} (ID: ${id})`);

    // Xóa các bản ghi liên quan trước (cascade thủ công)
    try {
      // Xóa bản ghi chấm công
      await pool.query('DELETE FROM AttendanceRecords WHERE user_id = ?', [id]);
      console.log(`🗑️ Deleted attendance records for user ${id}`);
      
      // Xóa dữ liệu khuôn mặt
      await pool.query('DELETE FROM FacialData WHERE user_id = ?', [id]);
      console.log(`🗑️ Deleted facial data for user ${id}`);
      
      // Xóa người dùng (bản ghi chính)
      await pool.query('DELETE FROM Users WHERE user_id = ?', [id]);
      console.log(`🗑️ Deleted user ${id} from Users table`);
    } catch (err) {
      console.error('❌ Error during cascade delete:', err);
      throw new Error('Failed to delete employee and related data');
    }

    return res.json({ message: 'Employee deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete employee', error: err.message });
  }
};

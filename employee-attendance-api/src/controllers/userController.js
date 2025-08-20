const pool = require('../utils/db');

// Tạo nhân viên mới
const createUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, departmentId, roleId } = req.body;
    
    if (!name || !email || !password || !departmentId || !roleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // KT email đã tồn tại
    const [[existingUser]] = await pool.query(
      'SELECT user_id FROM Users WHERE email = ?',
      [email]
    );
    
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Get department_id từ tên phòng ban
    const [[dept]] = await pool.query(
      'SELECT department_id FROM Departments WHERE department_name = ?',
      [departmentId]
    );
    
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }

    // Thêm người dùng mới
    const [result] = await pool.query(
      `INSERT INTO Users (full_name, email, phone_number, department_id, role, password_hash, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [name, email, phoneNumber || null, dept.department_id, roleId, 'temp_password_hash']
    );

    return res.status(201).json({ 
      message: 'User created successfully',
      userId: result.insertId 
    });
  } catch (err) {
    console.error('Create User Error:', err);
    return res.status(500).json({ message: 'Failed to create user', error: err.message });
  }
};

// Lấy tất cả nhân viên
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, department_id FROM Users WHERE role != "super_admin"'
    );
    return res.json({ users: rows });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
};

// Lấy nhân viên theo ID
const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, department_id FROM Users WHERE user_id = ?',
      [id]
    );
    
    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.json(rows[0]);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// Cập nhật nhân viên
const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, email, phoneNumber, departmentId, roleId } = req.body;
    
    if (!name || !email || !departmentId || !roleId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get department_id từ tên phòng ban
    const [[dept]] = await pool.query(
      'SELECT department_id FROM Departments WHERE department_name = ?',
      [departmentId]
    );
    
    if (!dept) {
      return res.status(400).json({ message: 'Department not found' });
    }

    await pool.query(
      `UPDATE Users SET full_name = ?, email = ?, phone_number = ?, department_id = ?, role = ? WHERE user_id = ?`,
      [name, email, phoneNumber || null, dept.department_id, roleId, id]
    );

    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
};

// Xóa nhân viên
const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await pool.query('DELETE FROM Users WHERE user_id = ?', [id]);
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
};

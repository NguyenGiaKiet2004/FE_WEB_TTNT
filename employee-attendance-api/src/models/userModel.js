const pool = require('../utils/db');

// Hàm tìm người dùng theo email
exports.findByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
  return rows[0];
};

// Hàm tạo người dùng mới
exports.create = async (full_name, email, password_hash, role, department_id) => {
  const [result] = await pool.query(
    `INSERT INTO Users (full_name, email, password_hash, role, department_id) VALUES (?, ?, ?, ?, ?)`,
    [full_name, email, password_hash, role, department_id]
  );
  return result.insertId;
};

// Hàm lấy tất cả nhân viên
exports.getAll = async () => {
  const [rows] = await pool.query(`
    SELECT
      u.user_id,
      u.full_name,
      u.email,
      u.phone_number,
      u.role,
      d.department_name
    FROM Users u
    LEFT JOIN Departments d ON u.department_id = d.department_id
  `);
  return rows;
};

// Hàm xóa người dùng theo ID
exports.delete = async (userId) => {
  const [result] = await pool.query('DELETE FROM Users WHERE user_id = ?', [userId]);
  return result.affectedRows;
};
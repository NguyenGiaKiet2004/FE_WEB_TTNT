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
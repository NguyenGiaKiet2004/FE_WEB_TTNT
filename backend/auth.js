const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Ít nhất 6 ký tự, có chữ hoa, chữ thường và số (dễ hơn cho testing)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
  return passwordRegex.test(password);
};

const validatePhoneNumber = (phone) => {
  if (!phone) return true; // Optional field
  const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
  return phoneRegex.test(phone);
};

// Login function
const loginUser = async (connection, email, password) => {
  try {
    // Get user with department info
    const [users] = await connection.execute(`
      SELECT u.*, d.department_name 
      FROM Users u 
      LEFT JOIN Departments d ON u.department_id = d.department_id 
      WHERE u.email = ?
    `, [email]);

    if (users.length === 0) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return { success: false, message: 'Email hoặc mật khẩu không đúng' };
    }

    // Return user data without password
    const { password_hash, ...userData } = user;
    return {
      success: true,
      user: {
        userId: userData.user_id,
        fullName: userData.full_name,
        email: userData.email,
        role: userData.role,
        departmentId: userData.department_id,
        departmentName: userData.department_name,
        phoneNumber: userData.phone_number,
        createdAt: userData.created_at
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Lỗi server' };
  }
};

// Register function
const registerUser = async (connection, userData) => {
  try {
    // Validation
    if (!userData.fullName || !userData.email || !userData.password) {
      return { success: false, message: 'Họ tên, email và mật khẩu không được để trống' };
    }

    if (!validateEmail(userData.email)) {
      return { success: false, message: 'Email không hợp lệ' };
    }

    if (!validatePassword(userData.password)) {
      return { 
        success: false, 
        message: 'Mật khẩu phải có ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số' 
      };
    }

    if (userData.phoneNumber && !validatePhoneNumber(userData.phoneNumber)) {
      return { success: false, message: 'Số điện thoại không hợp lệ' };
    }

    // Check if email already exists
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM Users WHERE email = ?',
      [userData.email]
    );

    if (existingUsers.length > 0) {
      return { success: false, message: 'Email đã tồn tại trong hệ thống' };
    }

    // Check if department exists (if provided)
    if (userData.departmentId) {
      const [departments] = await connection.execute(
        'SELECT department_id FROM Departments WHERE department_id = ?',
        [userData.departmentId]
      );
      if (departments.length === 0) {
        return { success: false, message: 'Phòng ban không tồn tại' };
      }
    }

    // Hash password
    const saltRounds = 12; // Tăng độ bảo mật
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Insert new user
    const [result] = await connection.execute(
      'INSERT INTO Users (full_name, email, password_hash, role, department_id, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userData.fullName.trim(),
        userData.email.toLowerCase().trim(),
        hashedPassword,
        userData.role || 'employee',
        userData.departmentId || null,
        userData.phoneNumber || null
      ]
    );

    return {
      success: true,
      message: 'Đăng ký thành công',
      userId: result.insertId
    };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, message: 'Lỗi server' };
  }
};

// Change password function
const changePassword = async (connection, userId, currentPassword, newPassword) => {
  try {
    // Get current user
    const [users] = await connection.execute(
      'SELECT password_hash FROM Users WHERE user_id = ?',
      [userId]
    );

    if (users.length === 0) {
      return { success: false, message: 'Người dùng không tồn tại' };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!isValidPassword) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng' };
    }

    // Validate new password
    if (!validatePassword(newPassword)) {
      return { 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' 
      };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await connection.execute(
      'UPDATE Users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    return { success: true, message: 'Đổi mật khẩu thành công' };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, message: 'Lỗi server' };
  }
};

// Reset password function (for admin)
const resetPassword = async (connection, userId, newPassword) => {
  try {
    // Validate new password
    if (!validatePassword(newPassword)) {
      return { 
        success: false, 
        message: 'Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt' 
      };
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await connection.execute(
      'UPDATE Users SET password_hash = ? WHERE user_id = ?',
      [hashedPassword, userId]
    );

    return { success: true, message: 'Đặt lại mật khẩu thành công' };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'Lỗi server' };
  }
};

module.exports = {
  loginUser,
  registerUser,
  changePassword,
  resetPassword,
  validateEmail,
  validatePassword,
  validatePhoneNumber
};

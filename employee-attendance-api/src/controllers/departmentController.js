const pool = require('../utils/db');

// [GET] /api/departments - Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT department_id, department_name, created_at FROM Departments ORDER BY department_name');
    console.log('📋 Available departments:', rows);
    return res.json({ departments: rows });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch departments', error: err.message });
  }
};

// [POST] /api/departments - Create new department
exports.createDepartment = async (req, res) => {
  try {
    const { department_name } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // Check phòng ban đã tồn tại
    const [[existingDept]] = await pool.query(
      'SELECT department_id FROM Departments WHERE department_name = ?',
      [department_name]
    );
    
    if (existingDept) {
      return res.status(400).json({ message: 'Department already exists' });
    }

    // Thêm phòng ban mới
    const [result] = await pool.query(
      'INSERT INTO Departments (department_name, created_at) VALUES (?, NOW())',
      [department_name]
    );

    console.log(`🏢 New department created: ${department_name} (ID: ${result.insertId})`);

    // Lấy phòng ban vừa tạo
    const [newDept] = await pool.query(
      'SELECT department_id, department_name, created_at FROM Departments WHERE department_id = ?',
      [result.insertId]
    );

    return res.status(201).json(newDept[0]);
  } catch (err) {
    console.error('❌ Create Department Error:', err);
    return res.status(500).json({ message: 'Failed to create department', error: err.message });
  }
};

// PUT: /api/departments/:id - Update phòng ban
exports.updateDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid department id' });
    }

    const { department_name } = req.body;
    
    if (!department_name) {
      return res.status(400).json({ message: 'Department name is required' });
    }

    // KT phòng ban có tồn tại hay không
    const [[existingDept]] = await pool.query(
      'SELECT department_id, department_name FROM Departments WHERE department_id = ?',
      [id]
    );
    
    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // KT tên PB mới có xung đột vs PB khác
    const [[conflictDept]] = await pool.query(
      'SELECT department_id FROM Departments WHERE department_name = ? AND department_id != ?',
      [department_name, id]
    );
    
    if (conflictDept) {
      return res.status(400).json({ message: 'Department name already exists' });
    }

    // Update department
    await pool.query(
      'UPDATE Departments SET department_name = ? WHERE department_id = ?',
      [department_name, id]
    );

    console.log(`🏢 Department updated: ${existingDept.department_name} → ${department_name} (ID: ${id})`);

    // Lấy PB đã update
    const [updatedDept] = await pool.query(
      'SELECT department_id, department_name, created_at FROM Departments WHERE department_id = ?',
      [id]
    );

    return res.json(updatedDept[0]);
  } catch (err) {
    console.error('❌ Update Department Error:', err);
    return res.status(500).json({ message: 'Failed to update department', error: err.message });
  }
};

// DELETE: /api/departments/:id - Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid department id' });
    }

    // KT phòng ban có tồn tại hay không
    const [[existingDept]] = await pool.query(
      'SELECT department_id, department_name FROM Departments WHERE department_id = ?',
      [id]
    );
    
    if (!existingDept) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // KT phòng ban có nhân viên hay không
    const [[employeeCount]] = await pool.query(
      'SELECT COUNT(*) as count FROM Users WHERE department_id = ?',
      [id]
    );
    
    if (employeeCount.count > 0) {
      return res.status(400).json({ 
        message: `Cannot delete department. ${employeeCount.count} employee(s) are assigned to this department. Please reassign or remove employees first.` 
      });
    }

    console.log(`🗑️ Deleting department: ${existingDept.department_name} (ID: ${id})`);

    // Delete department
    await pool.query('DELETE FROM Departments WHERE department_id = ?', [id]);

    return res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    console.error('❌ Delete Department Error:', err);
    return res.status(500).json({ message: 'Failed to delete department', error: err.message });
  }
};

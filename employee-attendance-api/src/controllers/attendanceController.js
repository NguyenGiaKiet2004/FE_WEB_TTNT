const pool = require('../utils/db');

// GET: /api/attendance - Lấy danh sách bản ghi chấm công
exports.getAttendanceRecords = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '10', 10)));
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM AttendanceRecords`);

    const [rows] = await pool.query(
      `SELECT ar.record_id, ar.user_id, ar.check_in_time, ar.check_out_time, ar.status, ar.record_date,
              u.full_name, d.department_name, d.department_id
       FROM AttendanceRecords ar
       JOIN Users u ON ar.user_id = u.user_id
       LEFT JOIN Departments d ON u.department_id = d.department_id
       ORDER BY ar.check_in_time DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const records = rows.map((r) => ({
      id: r.record_id,
      employeeId: String(r.user_id),
      checkIn: r.check_in_time,
      checkOut: r.check_out_time,
      status: r.status,
      recordDate: r.record_date,
      fullName: r.full_name,
      departmentName: r.department_name,
      departmentId: r.department_id ?? null,
    }));

    return res.json({ total, page, pageSize: limit, records });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch attendance', error: err.message });
  }
};

// GET: /api/attendance/detail/:id - Get thông tin CHI TIẾT bản ghi chấm công theo ID
exports.getAttendanceDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid record id' });
    }

    const [rows] = await pool.query(
      `SELECT ar.record_id, ar.user_id, ar.check_in_time, ar.check_out_time, ar.status, ar.record_date,
              u.full_name, u.email, u.role, u.phone_number,
              d.department_id, d.department_name
       FROM AttendanceRecords ar
       JOIN Users u ON ar.user_id = u.user_id
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE ar.record_id = ?
       LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const r = rows[0];
    return res.json({
      id: r.record_id,
      user: {
        id: r.user_id,
        fullName: r.full_name,
        email: r.email,
        role: r.role,
        phoneNumber: r.phone_number,
        departmentId: r.department_id,
        departmentName: r.department_name,
      },
      checkIn: r.check_in_time,
      checkOut: r.check_out_time,
      status: r.status,
      recordDate: r.record_date,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch record detail', error: err.message });
  }
};

// GET: /api/attendance/series - Get dữ liệu chuỗi thời gian chấm công để vẽ biểu đồ
exports.getAttendanceSeries = async (req, res) => {
  try {
    const period = (req.query.period || 'daily').toString();
    let days = Math.max(1, Math.min(31, parseInt(req.query.days || '7', 10)));

    const today = new Date();
    let startCurr = new Date(today);
    let startPrev;

    if (period === 'weekly') {
      // Căn chỉnh về thứ Hai của tuần hiện tại
      const day = today.getDay();
      const deltaToMonday = (day + 6) % 7; // Sun->6, Mon->0, ...
      startCurr = new Date(today);
      startCurr.setDate(today.getDate() - deltaToMonday);
      startCurr.setHours(0, 0, 0, 0);
      days = 7;
      startPrev = new Date(startCurr);
      startPrev.setDate(startCurr.getDate() - 7);
    } else if (period === 'monthly') {
      // 30 ngày gần nhất (xem tháng đơn giản hóa)
      days = Math.max(1, Math.min(30, parseInt(req.query.days || '30', 10)));
      startCurr = new Date(today);
      startCurr.setDate(today.getDate() - (days - 1));
      startPrev = new Date(startCurr);
      startPrev.setDate(startCurr.getDate() - days);
    } else {
      // hàng ngày (mặc định): 7 ngày gần nhất
      days = Math.max(1, Math.min(31, parseInt(req.query.days || '7', 10)));
      startCurr = new Date(today);
      startCurr.setDate(today.getDate() - (days - 1));
      startPrev = new Date(startCurr);
      startPrev.setDate(startCurr.getDate() - days);
    }

    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };

    const viDay = (d) => {
      const wd = d.getDay(); // 0..6 (0=CN)
      return ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][wd];
    };

    const [[{ totalEmployees }]] = await pool.query(
      `SELECT COUNT(*) AS totalEmployees FROM Users WHERE role != 'super_admin'`
    );

    const computeSeries = async (startDate) => {
      const points = [];
      for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const dateStr = formatDate(d);
        
        try {
          const [[{ present = 0 }]] = await pool.query(
            `SELECT COUNT(DISTINCT user_id) AS present FROM AttendanceRecords WHERE record_date = ?`,
            [dateStr]
          );
          const rate = totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;
          points.push({ label: viDay(d), date: dateStr, value: rate });
        } catch (err) {
          console.error(`❌ Error computing series for date ${dateStr}:`, err);
          points.push({ label: viDay(d), date: dateStr, value: 0 });
        }
      }
      return points;
    };

    const current = await computeSeries(startCurr);
    const previous = await computeSeries(startPrev);

    return res.json({ current, previous });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to build attendance series', error: err.message });
  }
};

// POST: /api/attendance - Create bản ghi chấm công
exports.createAttendanceRecord = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
    
    if (!employeeId || !date) {
      return res.status(400).json({ message: 'Employee ID and date are required' });
    }

    // Kiểm tra xem bản ghi đã tồn tại cho nhân viên này và ngày này chưa
    const [[existingRecord]] = await pool.query(
      'SELECT record_id FROM AttendanceRecords WHERE user_id = ? AND record_date = ?',
      [employeeId, date]
    );
    
    if (existingRecord) {
      return res.status(400).json({ message: 'Attendance record already exists for this date' });
    }

    // Thêm bản ghi chấm công mới
    const [result] = await pool.query(
      `INSERT INTO AttendanceRecords (user_id, check_in_time, check_out_time, status, record_date, created_at) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [employeeId, checkIn || null, checkOut || null, status || null, date]
    );

    console.log(`📝 New attendance record created: Employee ${employeeId} on ${date} (ID: ${result.insertId})`);

    // Lấy bản ghi vừa tạo
    const [newRecord] = await pool.query(
      `SELECT ar.record_id, ar.user_id, ar.check_in_time, ar.check_out_time, ar.status, ar.record_date,
              u.full_name, d.department_name
       FROM AttendanceRecords ar
       JOIN Users u ON ar.user_id = u.user_id
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE ar.record_id = ?`,
      [result.insertId]
    );

    const mapped = newRecord.map((r) => ({
      id: r.record_id,
      employeeId: String(r.user_id),
      checkIn: r.check_in_time,
      checkOut: r.check_out_time,
      status: r.status,
      recordDate: r.record_date,
      fullName: r.full_name,
      departmentName: r.department_name,
    }));

    return res.status(201).json(mapped[0]);
  } catch (err) {
    console.error('❌ Create Attendance Record Error:', err);
    return res.status(500).json({ message: 'Failed to create attendance record', error: err.message });
  }
};

// PUT: /api/attendance/:id - Cập nhật bản ghi chấm công
exports.updateAttendanceRecord = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'Invalid record id' });
    }

    const { checkIn, checkOut, status, notes } = req.body;

    // Kiểm tra xem bản ghi có tồn tại không
    const [[existingRecord]] = await pool.query(
      'SELECT record_id FROM AttendanceRecords WHERE record_id = ?',
      [id]
    );
    
    if (!existingRecord) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Cập nhật bản ghi chấm công
    await pool.query(
      `UPDATE AttendanceRecords 
       SET check_in_time = ?, check_out_time = ?, status = ?
       WHERE record_id = ?`,
      [checkIn || null, checkOut || null, status || null, id]
    );

    console.log(`📝 Attendance record updated: ID ${id}`);

    // Lấy bản ghi đã cập nhật
    const [updatedRecord] = await pool.query(
      `SELECT ar.record_id, ar.user_id, ar.check_in_time, ar.check_out_time, ar.status, ar.record_date,
              u.full_name, d.department_name
       FROM AttendanceRecords ar
       JOIN Users u ON ar.user_id = u.user_id
       LEFT JOIN Departments d ON u.department_id = d.department_id
       WHERE ar.record_id = ?`,
      [id]
    );

    const mapped = updatedRecord.map((r) => ({
      id: r.record_id,
      employeeId: String(r.user_id),
      checkIn: r.check_in_time,
      checkOut: r.check_out_time,
      status: r.status,
      recordDate: r.record_date,
      fullName: r.full_name,
      departmentName: r.department_name,
    }));

    return res.json(mapped[0]);
  } catch (err) {
    console.error('❌ Update Attendance Record Error:', err);
    return res.status(500).json({ message: 'Failed to update attendance record', error: err.message });
  }
};

const pool = require('../utils/db');

// GET: /api/dashboard/stats - Get thống kê dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Configs (optional)
    let workEndTime = '17:00:00';
    try {
      const [cfg] = await pool.query(
        `SELECT config_value FROM SystemConfigs WHERE config_key = 'work_end_time'`
      );
      if (cfg && cfg.length > 0) {
        workEndTime = cfg[0].config_value;
      }
    } catch (_) {}

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const yday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yyyy2 = yday.getFullYear();
    const mm2 = String(yday.getMonth() + 1).padStart(2, '0');
    const dd2 = String(yday.getDate()).padStart(2, '0');
    const ydayStr = `${yyyy2}-${mm2}-${dd2}`;

    const [[{ count: totalEmployees }]] = await pool.query(
      `SELECT COUNT(*) AS count FROM Users WHERE role != 'super_admin'`
    );
    // Tổng số nhân viên hôm qua được ước tính bằng số lượng trước khi bắt đầu hôm nay
    const startOfTodayStr = `${todayStr} 00:00:00`;
    const [[{ count: ydayEmployees }]] = await pool.query(
      `SELECT COUNT(*) AS count FROM Users WHERE role != 'super_admin' AND created_at < ?`,
      [startOfTodayStr]
    );

    const [[todayAgg]] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_arrival,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN check_out_time IS NOT NULL AND TIME(check_out_time) < ? THEN 1 ELSE 0 END) as early_departure
       FROM AttendanceRecords WHERE record_date = ? AND status IS NOT NULL`,
      [workEndTime, todayStr]
    );

    const [[ydayAgg]] = await pool.query(
      `SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_arrival,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN check_out_time IS NOT NULL AND TIME(check_out_time) < ? THEN 1 ELSE 0 END) as early_departure
       FROM AttendanceRecords WHERE record_date = ? AND status IS NOT NULL`,
      [workEndTime, ydayStr]
    );

    const [[{ count: timeOff }]] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM Users u 
       WHERE u.role != 'super_admin' 
       AND u.user_id NOT IN (
         SELECT DISTINCT user_id FROM AttendanceRecords WHERE record_date = ?
       )`,
      [todayStr]
    );
    const [[{ count: ydayTimeOff }]] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM Users u 
       WHERE u.role != 'super_admin' 
       AND u.user_id NOT IN (
         SELECT DISTINCT user_id FROM AttendanceRecords WHERE record_date = ?
       )`,
      [ydayStr]
    );

    const safe = (n) => (Number.isFinite(n) ? n : 0);
    const percentChange = (prev, curr) => {
      if (!prev || prev === 0) return 0;
      return parseFloat((((safe(curr) - safe(prev)) / safe(prev)) * 100).toFixed(1));
    };

    const onTime = safe(todayAgg?.on_time);
    const lateArrival = safe(todayAgg?.late_arrival);
    const absent = safe(todayAgg?.absent);
    const earlyDeparture = safe(todayAgg?.early_departure);

    const onTimeChange = percentChange(safe(ydayAgg?.on_time), onTime);
    const lateArrivalChange = percentChange(safe(ydayAgg?.late_arrival), lateArrival);
    const absentChange = percentChange(safe(ydayAgg?.absent), absent);
    const earlyDepartureChange = percentChange(safe(ydayAgg?.early_departure), earlyDeparture);
    const timeOffChange = percentChange(safe(ydayTimeOff), safe(timeOff));

    // Debug logging
    console.log('📊 Dashboard Stats Debug:', {
      today: { onTime, lateArrival, absent, earlyDeparture, timeOff },
      yesterday: { 
        onTime: safe(ydayAgg?.on_time), 
        lateArrival: safe(ydayAgg?.late_arrival), 
        absent: safe(ydayAgg?.absent), 
        earlyDeparture: safe(ydayAgg?.early_departure), 
        timeOff: safe(ydayTimeOff) 
      },
      changes: { onTimeChange, lateArrivalChange, absentChange, earlyDepartureChange, timeOffChange },
      totalEmployees,
      employeesAdded: totalEmployees - ydayEmployees
    });

    // Cấu trúc phẳng cho việc sử dụng frontend hiện tại
    return res.json({
      totalEmployees,
      employeesAdded: totalEmployees - ydayEmployees,
      onTime,
      lateArrival,
      absent,
      earlyDeparture,
      timeOff: safe(timeOff),
      onTimeChange,
      lateArrivalChange,
      absentChange,
      earlyDepartureChange,
      timeOffChange,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
};

// GET: /api/notifications - Get thông báo
exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit || '20', 10)));
    const [rows] = await pool.query(`
      SELECT ar.record_id, ar.user_id, ar.check_in_time, ar.check_out_time, ar.status,
             u.full_name
      FROM AttendanceRecords ar
      JOIN Users u ON ar.user_id = u.user_id
      ORDER BY GREATEST(COALESCE(ar.check_in_time, '1970-01-01'), COALESCE(ar.check_out_time, '1970-01-01')) DESC
      LIMIT ?
    `, [limit]);

    const notifications = [];
    for (const r of rows) {
      if (r.check_in_time) {
        notifications.push({
          id: `${r.record_id}-in`,
          type: 'attendance',
          title: `${r.full_name} checked in`,
          message: `${r.full_name} checked in at ${new Date(r.check_in_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: r.check_in_time,
          read: false,
        });
      }
      if (r.check_out_time) {
        notifications.push({
          id: `${r.record_id}-out`,
          type: 'attendance',
          title: `${r.full_name} checked out`,
          message: `${r.full_name} checked out at ${new Date(r.check_out_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: r.check_out_time,
          read: false,
        });
      }
    }

    return res.json({ notifications });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

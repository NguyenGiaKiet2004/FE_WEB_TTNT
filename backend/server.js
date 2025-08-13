const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const { loginUser, registerUser } = require('./auth');
const { getSystemConfig } = require('./system-config');

const app = express();
const PORT = 3001;

// CORS configuration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware
app.use(express.json());

// Session configuration
app.use(session({
  secret: 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

let connection;

// Initialize database connection
async function initDatabase() {
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully!');
    
    // Test query
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    console.log(`📊 Total users in database: ${rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ 
    message: 'Authentication required',
    authenticated: false 
  });
}

// Routes

// 1. Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt:', { email, password: password ? '***' : 'undefined' });
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({
        message: 'Email và mật khẩu không được để trống',
        authenticated: false
      });
    }

    // Use authentication service
    const result = await loginUser(connection, email, password);
    
    if (!result.success) {
      console.log('❌ Login failed:', result.message);
      return res.status(401).json({
        message: result.message,
        authenticated: false
      });
    }

    // Set session
    req.session.userId = result.user.userId;
    req.session.user = result.user;

    console.log('✅ Login successful for user:', result.user.fullName);

    res.json({
      message: 'Đăng nhập thành công',
      authenticated: true,
      user: result.user
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      message: 'Lỗi server',
      authenticated: false
    });
  }
});

// 2. Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi khi đăng xuất' });
    }
    res.clearCookie('connect.sid');
    res.json({
      message: 'Đăng xuất thành công',
      authenticated: false
    });
  });
});

// 3. Get current user endpoint
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      authenticated: true,
      user: req.session.user
    });
  } else {
    res.json({
      authenticated: false,
      user: null
    });
  }
});

// 4. Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, departmentId, phoneNumber, role = 'employee' } = req.body;

    // Use authentication service
    const result = await registerUser(connection, {
      fullName,
      email,
      password,
      departmentId,
      phoneNumber,
      role
    });

    if (!result.success) {
      return res.status(400).json({
        message: result.message
      });
    }

    res.status(201).json({
      message: result.message,
      userId: result.userId
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      message: 'Lỗi server'
    });
  }
});

// 5. Get departments endpoint (public for registration)
app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await connection.execute(
      'SELECT department_id, department_name FROM Departments ORDER BY department_name'
    );
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách phòng ban' });
  }
});

// 6. Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get today's and yesterday's dates
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Get total employees (excluding super_admin)
    const [totalEmployeesResult] = await connection.execute('SELECT COUNT(*) as count FROM Users WHERE role != "super_admin"');
    const totalEmployees = totalEmployeesResult[0].count;
    
    // Get total employees yesterday (for comparison)
    // Note: This is simplified. In a real system, you'd track user creation dates
    const [totalEmployeesYesterdayResult] = await connection.execute(
      'SELECT COUNT(*) as count FROM Users WHERE role != "super_admin"'
    );
    const totalEmployeesYesterday = totalEmployeesYesterdayResult[0].count;
    const employeesAdded = totalEmployees - totalEmployeesYesterday;
    
    // Get today's attendance records for processing
    const [attendanceRecordsToday] = await connection.execute(`
      SELECT 
        TIME(check_in_time) as check_in_time,
        TIME(check_out_time) as check_out_time
      FROM AttendanceRecords 
      WHERE record_date = ?
    `, [today]);
    
    // Get system configurations for time thresholds
    const lateThreshold = await getSystemConfig('late_threshold', '09:00:00');
    const earlyDepartureThreshold = await getSystemConfig('early_departure_threshold', '17:00:00');
    
    // Process attendance logic in Node.js
    let onTime = 0;
    let late = 0;
    let earlyDeparture = 0;
    
    attendanceRecordsToday.forEach(record => {
      const checkInTime = record.check_in_time;
      const checkOutTime = record.check_out_time;
      
      // On Time: Check-in <= late_threshold
      if (checkInTime <= lateThreshold) {
        onTime++;
      } else {
        // Late: Check-in > late_threshold
        late++;
      }
      
      // Early Departure: Has check-out AND check-out < early_departure_threshold
      if (checkOutTime && checkOutTime < earlyDepartureThreshold) {
        earlyDeparture++;
      }
    });
    
    const todayStats = { on_time: onTime, late, early_departure: earlyDeparture };
    
    // Calculate absent (employees who didn't check in today)
    const [absentCount] = await connection.execute(`
      SELECT COUNT(*) as absent_count
      FROM Users u
      WHERE u.role != 'super_admin' 
      AND u.user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM AttendanceRecords 
        WHERE record_date = ?
      )
    `, [today]);
    
    const absent = absentCount[0].absent_count;
    
    // Get yesterday's attendance records for processing
    const [attendanceRecordsYesterday] = await connection.execute(`
      SELECT 
        TIME(check_in_time) as check_in_time,
        TIME(check_out_time) as check_out_time
      FROM AttendanceRecords 
      WHERE record_date = ?
    `, [yesterdayStr]);
    
    // Process yesterday's attendance logic in Node.js
    let onTimeYesterday = 0;
    let lateYesterday = 0;
    let earlyDepartureYesterday = 0;
    
    attendanceRecordsYesterday.forEach(record => {
      const checkInTime = record.check_in_time;
      const checkOutTime = record.check_out_time;
      
      // On Time: Check-in <= late_threshold
      if (checkInTime <= lateThreshold) {
        onTimeYesterday++;
      } else {
        // Late: Check-in > late_threshold
        lateYesterday++;
      }
      
      // Early Departure: Has check-out AND check-out < early_departure_threshold
      if (checkOutTime && checkOutTime < earlyDepartureThreshold) {
        earlyDepartureYesterday++;
      }
    });
    
    const yesterdayStats = { 
      on_time: onTimeYesterday, 
      late: lateYesterday, 
      early_departure: earlyDepartureYesterday 
    };
    
    // Calculate absent for yesterday
    const [absentCountYesterday] = await connection.execute(`
      SELECT COUNT(*) as absent_count
      FROM Users u
      WHERE u.role != 'super_admin' 
      AND u.user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM AttendanceRecords 
        WHERE record_date = ?
      )
    `, [yesterdayStr]);
    
    const absentYesterday = absentCountYesterday[0].absent_count;
    
    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) {
        return current > 0 ? 100 : 0; // If previous was 0 and current is > 0, it's a 100% increase
      }
      return ((current - previous) / previous) * 100;
    };
    
    const onTimeChange = calculatePercentageChange(todayStats.on_time || 0, yesterdayStats.on_time || 0);
    const lateChange = calculatePercentageChange(todayStats.late || 0, yesterdayStats.late || 0);
    const absentChange = calculatePercentageChange(absent, absentYesterday);
    const earlyDepartureChange = calculatePercentageChange(todayStats.early_departure || 0, yesterdayStats.early_departure || 0);
    
    // Placeholder for time-off (needs actual logic if time-off records are tracked)
    const timeOff = 0;
    const timeOffChange = 0;
    
    const stats = {
      totalEmployees: totalEmployees,
      employeesAdded: employeesAdded, // New: for Total Employees description
      onTime: todayStats.on_time || 0,
      onTimeChange: onTimeChange, // New: for On Time description
      lateArrival: todayStats.late || 0,
      lateArrivalChange: lateChange, // New: for Late Arrival description
      absent: absent,
      absentChange: absentChange, // New: for Absent description
      earlyDeparture: todayStats.early_departure || 0,
      earlyDepartureChange: earlyDepartureChange, // New: for Early Departure description
      timeOff: timeOff,
      timeOffChange: timeOffChange // New: for Time-off description
    };
    
    await connection.end();
    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy thống kê dashboard' });
  }
});

// 7. Get employees endpoint
app.get('/api/employees', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [employees] = await connection.execute(`
      SELECT 
        u.user_id as id,
        u.full_name as fullName,
        u.email,
        u.role,
        u.phone_number as phoneNumber,
        d.department_name as department
      FROM Users u
      LEFT JOIN Departments d ON u.department_id = d.department_id
      WHERE u.role != 'super_admin'
      ORDER BY u.full_name
    `);
    
    await connection.end();
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên' });
  }
});

// 8. Get system configurations endpoint (for super_admin)
app.get('/api/system/configs', async (req, res) => {
  try {
    const { getAllSystemConfigs } = require('./system-config');
    const configs = await getAllSystemConfigs();
    res.json(configs);
  } catch (error) {
    console.error('Get system configs error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy cấu hình hệ thống' });
  }
});

// 9. Update system configuration endpoint (for super_admin)
app.put('/api/system/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;
    
    console.log('🔧 Updating system config:', { key, value, description });
    
    if (!value) {
      console.log('❌ Missing value for config update');
      return res.status(400).json({ message: 'Giá trị cấu hình không được để trống' });
    }
    
    const { setSystemConfig } = require('./system-config');
    const success = await setSystemConfig(key, value, description);
    
    if (success) {
      // Clear system config cache to force refresh
      const { clearSystemConfigCache } = require('./system-config');
      clearSystemConfigCache();
      
      console.log('✅ Config updated successfully:', key, '=', value);
      res.json({ message: 'Cập nhật cấu hình thành công' });
    } else {
      console.log('❌ Failed to update config:', key);
      res.status(500).json({ message: 'Lỗi khi cập nhật cấu hình' });
    }
  } catch (error) {
    console.error('Update system config error:', error);
    res.status(500).json({ message: 'Lỗi khi cập nhật cấu hình hệ thống' });
  }
});

// 10. Get attendance records endpoint
app.get('/api/attendance', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [records] = await connection.execute(`
      SELECT 
        ar.record_id as id,
        ar.user_id as employeeId,
        ar.check_in_time as checkIn,
        ar.check_out_time as checkOut,
        ar.status,
        ar.record_date as recordDate,
        u.full_name as employeeName,
        d.department_name as department
      FROM AttendanceRecords ar
      LEFT JOIN Users u ON ar.user_id = u.user_id
      LEFT JOIN Departments d ON u.department_id = d.department_id
      ORDER BY ar.record_date DESC, ar.check_in_time DESC
      LIMIT 50
    `);
    
    await connection.end();
    res.json(records);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu chấm công' });
  }
});

// Start server
async function startServer() {
  await initDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📝 API endpoints:`);
    console.log(`   POST /api/auth/login - Đăng nhập`);
    console.log(`   POST /api/auth/logout - Đăng xuất`);
    console.log(`   GET  /api/auth/me - Lấy thông tin user hiện tại`);
    console.log(`   POST /api/auth/register - Đăng ký`);
    console.log(`   GET  /api/departments - Lấy danh sách phòng ban`);
    console.log(`   GET  /api/dashboard/stats - Thống kê dashboard`);
  });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  if (connection) {
    await connection.end();
  }
  process.exit(0);
});

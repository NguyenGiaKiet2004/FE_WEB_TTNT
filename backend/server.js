const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const bcrypt = require('bcrypt');

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
    secure: false,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'lax'
  },
  name: 'smart-attendance-session'
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

// Import functions
const { loginUser, registerUser } = require('./auth.js');
const { getSystemConfig, clearSystemConfigCache, getAllSystemConfigs } = require('./system-config.js');

// Routes

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email và mật khẩu không được để trống' 
      });
    }

    const result = await loginUser(connection, email, password);

    if (result.success) {
      // Set session
      req.session.userId = result.user.userId;
      req.session.user = result.user;
      
      console.log('🔐 Login successful - Session data:', {
        sessionId: req.sessionID,
        userId: req.session.userId,
        user: req.session.user
      });
      
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: result.user
      });
    } else {
      res.status(401).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi đăng xuất'
      });
    }
    
    res.clearCookie('smart-attendance-session');
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  });
});

app.get('/api/auth/me', async (req, res) => {
  try {
    console.log('🔍 GetCurrentUser called - Session data:', {
      sessionId: req.sessionID,
      userId: req.session.userId,
      session: req.session
    });
    
    if (!req.session.userId) {
      console.log('❌ No userId in session, returning 401');
      return res.status(401).json({
        success: false,
        message: 'Chưa đăng nhập'
      });
    }

    const [users] = await connection.execute(`
      SELECT u.*, d.department_name
      FROM Users u
      LEFT JOIN Departments d ON u.department_id = d.department_id
      WHERE u.user_id = ?
    `, [req.session.userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }

    const user = users[0];
    const { password_hash, ...userData } = user;

    console.log('✅ User found, returning user data');
    res.json({
      authenticated: true,
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
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, departmentId, phoneNumber, role } = req.body;

    const result = await registerUser(connection, {
      fullName,
      email,
      password,
      departmentId,
      phoneNumber,
      role
    });

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        userId: result.userId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
});

// Dashboard routes
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    console.log('📊 Dashboard stats requested');
    
    // Get all system configs (not just one key)
    const systemConfigs = await getAllSystemConfigs();
    console.log('⚙️ System configs loaded:', systemConfigs);
    
    // Extract specific config values with defaults
    const workStartTime = systemConfigs.work_start_time?.value || '09:00:00';
    const workEndTime = systemConfigs.work_end_time?.value || '17:00:00';
    
    console.log('⏰ Time configs:', { workStartTime, workEndTime });
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    console.log('📅 Dates:', { today, yesterday });
    
    // Get total employees
    const [totalEmployeesResult] = await connection.execute('SELECT COUNT(*) as count FROM Users WHERE role != "super_admin"');
    const totalEmployees = totalEmployeesResult[0].count;
    console.log('👥 Total employees:', totalEmployees);
    
    // Get yesterday's total employees for comparison
    const [yesterdayEmployeesResult] = await connection.execute('SELECT COUNT(*) as count FROM Users WHERE role != "super_admin"');
    const yesterdayEmployees = yesterdayEmployeesResult[0].count;
    
    // Get today's attendance data with proper time comparison
    const [todayAttendance] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN TIME(check_in_time) <= ? THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN TIME(check_in_time) > ? THEN 1 ELSE 0 END) as late_arrival,
        SUM(CASE WHEN check_out_time IS NULL THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN check_out_time IS NOT NULL AND TIME(check_out_time) < ? THEN 1 ELSE 0 END) as early_departure
      FROM AttendanceRecords 
      WHERE DATE(check_in_time) = ?
    `, [
      workStartTime,
      workStartTime,
      workEndTime,
      today
    ]);
    console.log('📈 Today attendance:', todayAttendance[0]);
    
    // Get yesterday's attendance data for comparison
    const [yesterdayAttendance] = await connection.execute(`
      SELECT 
        COUNT(*) as total_records,
        SUM(CASE WHEN TIME(check_in_time) <= ? THEN 1 ELSE 0 END) as on_time,
        SUM(CASE WHEN TIME(check_in_time) > ? THEN 1 ELSE 0 END) as late_arrival,
        SUM(CASE WHEN check_out_time IS NULL THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN check_out_time IS NOT NULL AND TIME(check_out_time) < ? THEN 1 ELSE 0 END) as early_departure
      FROM AttendanceRecords 
      WHERE DATE(check_in_time) = ?
    `, [
      workStartTime,
      workStartTime,
      workEndTime,
      yesterday
    ]);
    console.log('📈 Yesterday attendance:', yesterdayAttendance[0]);
    
    // Calculate time-off (employees not present today)
    const [timeOffResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM Users u 
      WHERE u.role != 'super_admin' 
      AND u.user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM AttendanceRecords 
        WHERE DATE(check_in_time) = ?
      )
    `, [today]);
    
    const timeOff = timeOffResult[0].count;
    console.log('🏖️ Time off:', timeOff);
    
    // Calculate yesterday's time-off
    const [yesterdayTimeOffResult] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM Users u 
      WHERE u.role != 'super_admin' 
      AND u.user_id NOT IN (
        SELECT DISTINCT user_id 
        FROM AttendanceRecords 
        WHERE DATE(check_in_time) = ?
      )
    `, [yesterday]);
    
    const yesterdayTimeOff = yesterdayTimeOffResult[0].count;
    
    // Calculate percentage changes
    const onTimeChange = yesterdayAttendance[0].on_time > 0 
      ? ((todayAttendance[0].on_time - yesterdayAttendance[0].on_time) / yesterdayAttendance[0].on_time * 100).toFixed(1)
      : 0;
    
    const lateArrivalChange = yesterdayAttendance[0].late_arrival > 0 
      ? ((todayAttendance[0].late_arrival - yesterdayAttendance[0].late_arrival) / yesterdayAttendance[0].late_arrival * 100).toFixed(1)
      : 0;
    
    const absentChange = yesterdayAttendance[0].absent > 0 
      ? ((todayAttendance[0].absent - yesterdayAttendance[0].absent) / yesterdayAttendance[0].absent * 100).toFixed(1)
      : 0;
    
    const earlyDepartureChange = yesterdayAttendance[0].early_departure > 0 
      ? ((todayAttendance[0].early_departure - yesterdayAttendance[0].early_departure) / yesterdayAttendance[0].early_departure * 100).toFixed(1)
      : 0;
    
    const timeOffChange = yesterdayTimeOff > 0 
      ? ((timeOff - yesterdayTimeOff) / yesterdayTimeOff * 100).toFixed(1)
      : 0;
    
    const response = {
      success: true,
      stats: {
        totalEmployees: {
          value: totalEmployees,
          change: totalEmployees - yesterdayEmployees,
          changeType: totalEmployees > yesterdayEmployees ? 'increase' : 'decrease'
        },
        onTime: {
          value: todayAttendance[0].on_time || 0,
          change: parseFloat(onTimeChange),
          changeType: parseFloat(onTimeChange) > 0 ? 'increase' : 'decrease'
        },
        lateArrival: {
          value: todayAttendance[0].late_arrival || 0,
          change: parseFloat(lateArrivalChange),
          changeType: parseFloat(lateArrivalChange) > 0 ? 'increase' : 'decrease'
        },
        absent: {
          value: todayAttendance[0].absent || 0,
          change: parseFloat(absentChange),
          changeType: parseFloat(absentChange) > 0 ? 'increase' : 'decrease'
        },
        earlyDeparture: {
          value: todayAttendance[0].early_departure || 0,
          change: parseFloat(earlyDepartureChange),
          changeType: parseFloat(earlyDepartureChange) > 0 ? 'increase' : 'decrease'
        },
        timeOff: {
          value: timeOff,
          change: parseFloat(timeOffChange),
          changeType: parseFloat(timeOffChange) > 0 ? 'increase' : 'decrease'
        }
      }
    };
    
    console.log('✅ Dashboard stats response:', response);
    res.json(response);
  } catch (error) {
    console.error('❌ Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const [departments] = await connection.execute('SELECT * FROM Departments ORDER BY department_name');
    res.json({ success: true, departments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/employees', async (req, res) => {
  try {
    const [employees] = await connection.execute(`
      SELECT u.*, d.department_name 
      FROM Users u 
      LEFT JOIN Departments d ON u.department_id = d.department_id 
      WHERE u.role != 'super_admin'
      ORDER BY u.full_name
    `);
    res.json({ success: true, employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.get('/api/attendance', async (req, res) => {
  try {
    const [attendance] = await connection.execute(`
      SELECT ar.*, u.full_name, d.department_name
      FROM AttendanceRecords ar
      JOIN Users u ON ar.user_id = u.user_id
      LEFT JOIN Departments d ON u.department_id = d.department_id
      ORDER BY ar.check_in_time DESC
      LIMIT 10
    `);
    res.json({ success: true, attendance });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Settings routes
app.get('/api/system/configs', async (req, res) => {
  try {
    console.log('📋 Fetching system configs...');
    
    // Use the shared connection instead of creating a new one
    const [configs] = await connection.execute(
      'SELECT config_key, config_value, description FROM SystemConfigs ORDER BY config_key'
    );
    
    console.log('📋 Raw database result:', configs);
    
    const result = {};
    configs.forEach(config => {
      result[config.config_key] = {
        value: config.config_value,
        description: config.description
      };
    });
    
    console.log('📋 Processed configs:', result);
    console.log('📋 Config keys:', Object.keys(result));
    
    res.json({ success: true, configs: result });
  } catch (error) {
    console.error('Get system configs error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.put('/api/system/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    console.log('🔧 Updating config:', { key, value });
    
    // Accept all config keys that frontend sends
    const validKeys = [
      'workStartTime', 'workEndTime', 'lateThreshold', 'earlyDepartureThreshold',
      'gracePeriodMinutes', 'maxLatePeriodMinutes', 'recognitionThreshold', 
      'minTrainingImages', 'emailNotifications', 'dailyReports', 'weeklyReports',
      'work_start_time', 'work_end_time', 'lunch_start_time', 'lunch_end_time',
      'late_threshold', 'early_departure_threshold', 'grace_period_minutes', 
      'max_late_period_minutes', 'recognition_threshold', 'min_training_images', 
      'email_notifications', 'daily_reports', 'weekly_reports'
    ];
    
    console.log('🔍 Valid keys:', validKeys);
    console.log('🔍 Checking if key is valid:', key, 'Result:', validKeys.includes(key));
    console.log('🔍 Key type:', typeof key);
    console.log('🔍 Value type:', typeof value);
    
    if (!validKeys.includes(key)) {
      console.log('❌ Invalid config key:', key);
      console.log('❌ Available valid keys:', validKeys);
      return res.status(400).json({ 
        success: false, 
        message: `Invalid configuration key: ${key}`,
        validKeys: validKeys
      });
    }
    
    await connection.execute(
      'UPDATE SystemConfigs SET config_value = ? WHERE config_key = ?',
      [value, key]
    );
    
    console.log('✅ Config updated successfully:', key);
    
    // Verify the update by reading back from database
    const [verifyRows] = await connection.execute(
      'SELECT config_value FROM SystemConfigs WHERE config_key = ?',
      [key]
    );
    console.log('🔍 Verification - Database value after update:', verifyRows[0]?.config_value);
    
    // Clear ALL system config cache to ensure fresh data
    clearSystemConfigCache();
    
    // Also clear any other related caches
    console.log('🗑️ Cache cleared for fresh data');
    
    res.json({ success: true, message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('❌ Update system config error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Test endpoint to check database directly
app.get('/api/system/configs/test', async (req, res) => {
  try {
    console.log('🧪 Testing database connection...');
    
    const [configs] = await connection.execute(
      'SELECT config_key, config_value FROM SystemConfigs ORDER BY config_key'
    );
    
    console.log('🧪 Database test result:', configs);
    
    res.json({ 
      success: true, 
      message: 'Database test successful',
      count: configs.length,
      configs: configs
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    res.status(500).json({ success: false, message: 'Database test failed', error: error.message });
  }
});

app.get('/api/system/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    if (!['workStartTime', 'workEndTime', 'lateThreshold', 'earlyDepartureThreshold'].includes(key)) {
      return res.status(400).json({ success: false, message: 'Invalid configuration key' });
    }
    
    const [configs] = await connection.execute(
      'SELECT config_value FROM SystemConfigs WHERE config_key = ?',
      [key]
    );
    
    if (configs.length === 0) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    
    res.json({ success: true, value: configs[0].config_value });
  } catch (error) {
    console.error('Get system config error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
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
    console.log(`   GET  /api/system/configs - Lấy cấu hình hệ thống`);
    console.log(`   PUT  /api/system/configs/:key - Cập nhật cấu hình`);
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


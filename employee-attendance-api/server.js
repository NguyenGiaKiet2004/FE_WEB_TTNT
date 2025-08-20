const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const departmentRoutes = require('./src/routes/departmentRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const systemRoutes = require('./src/routes/systemRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true,
}));

// Middleware gỡ lỗi để ghi log tất cả các yêu cầu
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/system', systemRoutes);

// Điểm cuối đăng xuất nhẹ cho JWT-based auth (client xóa token)
app.post('/api/auth/logout', (req, res) => {
  return res.json({ success: true, message: 'Logged out' });
});

// Roles (danh sách tĩnh dựa trên enum)
app.get('/api/roles', async (req, res) => {
  try {
    const roles = ['hr_manager', 'employee']; // super_admin excluded for typical UI flows
    return res.json(roles.map((name, idx) => ({ id: idx + 1, name })));
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch roles', error: err.message });
  }
});

// Điểm cuối gỡ lỗi để kiểm tra trạng thái cơ sở dữ liệu
app.get('/api/debug/database', async (req, res) => {
  try {
    const pool = require('./src/utils/db');
    const [departments] = await pool.query('SELECT * FROM Departments');
    const [users] = await pool.query('SELECT user_id, full_name, email, role, department_id FROM Users LIMIT 10');
    
    return res.json({
      departments,
      users,
      message: 'Database state retrieved successfully'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get database state', error: err.message });
  }
});

async function testDbConnection() {
  try {
    const pool = require('./src/utils/db');
    await pool.getConnection();
    console.log('✅ Database connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    process.exit(1);
  }
}

app.get('/', (req, res) => {
  res.send('Welcome to Employee Attendance API!');
});

app.listen(PORT, async () => {
  await testDbConnection();
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log('📝 Endpoints:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me');
  console.log('   POST /api/auth/logout');
  console.log('   GET  /api/departments');
  console.log('   POST /api/departments');
  console.log('   PUT  /api/departments/:id');
  console.log('   DELETE /api/departments/:id');
  console.log('   GET  /api/employees');
  console.log('   POST /api/employees');
  console.log('   PUT  /api/employees/:id');
  console.log('   DELETE /api/employees/:id');
  console.log('   GET  /api/employees/:id');
  console.log('   GET  /api/roles');
  console.log('   GET  /api/attendance');
  console.log('   GET  /api/attendance/series');
  console.log('   GET  /api/attendance/detail/:id');
  console.log('   POST /api/attendance');
  console.log('   PUT  /api/attendance/:id');
  console.log('   GET  /api/dashboard/stats');
  console.log('   GET  /api/dashboard/notifications');
  console.log('   GET  /api/debug/database');
  console.log('   GET  /api/system/configs');
  console.log('   PUT  /api/system/configs/:key');
  console.log('   POST /api/system/configs/initialize');
});
const express = require('express');
const pool = require('./src/utils/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Middleware để xử lý JSON body từ request

// Kiểm tra kết nối database
async function testDbConnection() {
  try {
    await pool.getConnection();
    console.log('✅ Database connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
}
testDbConnection();

// Định nghĩa một route đơn giản để kiểm tra server
app.get('/', (req, res) => {
  res.send('Welcome to Employee Attendance API!');
});

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
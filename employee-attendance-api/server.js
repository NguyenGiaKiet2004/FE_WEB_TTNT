// server.js
const express = require('express');
const pool = require('./src/utils/db');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);

async function testDbConnection() {
  try {
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
});
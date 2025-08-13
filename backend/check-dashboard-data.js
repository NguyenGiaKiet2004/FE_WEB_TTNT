const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function checkDashboardData() {
  let connection;
  
  try {
    console.log('🔍 Checking dashboard data...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // 1. Check total employees
    console.log('\n👥 Total Employees:');
    const [totalEmployees] = await connection.execute('SELECT COUNT(*) as count FROM Users WHERE role != "super_admin"');
    console.log(`  - Total: ${totalEmployees[0].count} employees`);
    
    // 2. Check today's attendance
    const today = new Date().toISOString().split('T')[0];
    console.log(`\n📅 Today's Attendance (${today}):`);
    
    const [attendanceStats] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'on_time' THEN 1 END) as on_time,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'early_departure' THEN 1 END) as early_departure,
        COUNT(*) as total
      FROM AttendanceRecords 
      WHERE record_date = ?
    `, [today]);
    
    console.log(`  - On Time: ${attendanceStats[0].on_time || 0}`);
    console.log(`  - Late: ${attendanceStats[0].late || 0}`);
    console.log(`  - Absent: ${attendanceStats[0].absent || 0}`);
    console.log(`  - Early Departure: ${attendanceStats[0].early_departure || 0}`);
    console.log(`  - Total Records: ${attendanceStats[0].total || 0}`);
    
    // 3. Check all attendance records
    console.log('\n📊 All Attendance Records:');
    const [allRecords] = await connection.execute('SELECT COUNT(*) as count FROM AttendanceRecords');
    console.log(`  - Total Records: ${allRecords[0].count}`);
    
    // 4. Check recent records
    console.log('\n🕒 Recent Records:');
    const [recentRecords] = await connection.execute(`
      SELECT record_date, status, COUNT(*) as count
      FROM AttendanceRecords 
      GROUP BY record_date, status
      ORDER BY record_date DESC, status
      LIMIT 10
    `);
    
    recentRecords.forEach(record => {
      console.log(`  - ${record.record_date}: ${record.status} = ${record.count}`);
    });
    
    // 5. Check if today has any records
    if (attendanceStats[0].total === 0) {
      console.log('\n⚠️ No attendance records for today!');
      console.log('💡 This is why dashboard shows "0" values.');
      console.log('💡 You may need to add some sample attendance data.');
    }
    
    console.log('\n🎉 Dashboard data check completed!');
    
  } catch (error) {
    console.error('❌ Dashboard data check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkDashboardData();

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function viewAttendanceData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    
    // Get all attendance records for today
    const [records] = await connection.execute(`
      SELECT 
        ar.user_id,
        u.full_name,
        ar.check_in_time,
        ar.check_out_time,
        ar.status,
        ar.record_date
      FROM AttendanceRecords ar
      LEFT JOIN Users u ON ar.user_id = u.user_id
      WHERE ar.record_date = ?
      ORDER BY ar.check_in_time
    `, [today]);

    console.log(`\n📊 Attendance Records for ${today}:`);
    console.log('─'.repeat(80));
    
    if (records.length === 0) {
      console.log('❌ No attendance records found for today');
    } else {
      records.forEach((record, index) => {
        console.log(`${index + 1}. User ID: ${record.user_id} | Name: ${record.full_name}`);
        console.log(`   Check-in: ${record.check_in_time} | Check-out: ${record.check_out_time || 'Not checked out'}`);
        console.log(`   Status: ${record.status}`);
        console.log('');
      });
    }

    // Get all users (including those without attendance)
    const [allUsers] = await connection.execute(`
      SELECT user_id, full_name, role
      FROM Users 
      WHERE role != 'super_admin'
      ORDER BY user_id
    `);

    console.log('👥 All Users (excluding super_admin):');
    console.log('─'.repeat(80));
    
    allUsers.forEach(user => {
      const hasAttendance = records.some(record => record.user_id === user.user_id);
      const status = hasAttendance ? '✅ Has attendance' : '❌ No attendance (Absent)';
      console.log(`${user.user_id}. ${user.full_name} - ${status}`);
    });

    // Calculate stats
    const totalUsers = allUsers.length;
    const totalRecords = records.length;
    const onTime = records.filter(r => r.check_in_time <= '09:00:00').length;
    const late = records.filter(r => r.check_in_time > '09:00:00').length;
    const earlyDeparture = records.filter(r => r.check_out_time && r.check_out_time < '17:00:00').length;
    const absent = totalUsers - totalRecords;

    console.log('\n📈 Statistics:');
    console.log('─'.repeat(80));
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Total Records: ${totalRecords}`);
    console.log(`On Time (≤9:00): ${onTime}`);
    console.log(`Late (>9:00): ${late}`);
    console.log(`Early Departure (<17:00): ${earlyDeparture}`);
    console.log(`Absent: ${absent}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

viewAttendanceData();

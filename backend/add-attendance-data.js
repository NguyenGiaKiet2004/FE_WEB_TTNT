const mysql = require('mysql2/promise');
const { getSystemConfig } = require('./system-config');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function addAttendanceData() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    
    // Check if data already exists for today
    const [existingData] = await connection.execute(
      'SELECT COUNT(*) as count FROM AttendanceRecords WHERE record_date = ?',
      [today]
    );
    
    if (existingData[0].count > 0) {
      console.log('⚠️  Attendance data already exists for today. Deleting old data...');
      await connection.execute('DELETE FROM AttendanceRecords WHERE record_date = ?', [today]);
    }

    // Get all non-super_admin users
    const [users] = await connection.execute(
      'SELECT user_id FROM Users WHERE role != "super_admin"'
    );

    console.log(`📊 Found ${users.length} users to add attendance data`);

    // Sample attendance data with realistic times
    const attendanceData = [
      // User 1: On time, normal check-out
      {
        user_id: users[0].user_id,
        check_in_time: '08:45:00',
        check_out_time: '17:30:00',
        status: 'on_time'
      },
      // User 2: Late arrival, early departure
      {
        user_id: users[1].user_id,
        check_in_time: '09:15:00',
        check_out_time: '16:45:00',
        status: 'late'
      },
      // User 3: On time, early departure
      {
        user_id: users[2].user_id,
        check_in_time: '08:30:00',
        check_out_time: '16:30:00',
        status: 'on_time'
      },
      // User 4: Late arrival, normal check-out
      {
        user_id: users[3].user_id,
        check_in_time: '09:30:00',
        check_out_time: '17:15:00',
        status: 'late'
      }
    ];

    // Add data for each user (if we have more than 4 users, add more data)
    for (let i = 0; i < Math.min(users.length, 4); i++) {
      const data = attendanceData[i];
      // Create proper datetime values
      const checkInDateTime = `${today} ${data.check_in_time}`;
      const checkOutDateTime = `${today} ${data.check_out_time}`;
      
      await connection.execute(`
        INSERT INTO AttendanceRecords 
        (user_id, check_in_time, check_out_time, status, record_date) 
        VALUES (?, ?, ?, ?, ?)
      `, [data.user_id, checkInDateTime, checkOutDateTime, data.status, today]);
      
      console.log(`✅ Added attendance for user ${data.user_id}: ${data.check_in_time} - ${data.check_out_time} (${data.status})`);
    }

    // If we have more than 4 users, add some absent users (no attendance record)
    if (users.length > 4) {
      console.log(`📝 ${users.length - 4} users will be marked as absent (no attendance record)`);
    }

    // Show summary
    const [totalRecords] = await connection.execute(
      'SELECT COUNT(*) as count FROM AttendanceRecords WHERE record_date = ?',
      [today]
    );
    
    // Get system configurations for time thresholds
    const lateThreshold = await getSystemConfig('late_threshold', '09:00:00');
    const earlyDepartureThreshold = await getSystemConfig('early_departure_threshold', '17:00:00');
    
    // Get all records and process in Node.js (same logic as backend)
    const [allRecords] = await connection.execute(`
      SELECT 
        TIME(check_in_time) as check_in_time,
        TIME(check_out_time) as check_out_time
      FROM AttendanceRecords 
      WHERE record_date = ?
    `, [today]);
    
    let onTimeCount = 0;
    let lateCount = 0;
    let earlyDepartureCount = 0;
    
    allRecords.forEach(record => {
      const checkInTime = record.check_in_time;
      const checkOutTime = record.check_out_time;
      
      console.log(`Debug: User check_in_time="${checkInTime}", check_out_time="${checkOutTime}"`);
      
      // Convert to string and extract time part if needed
      const checkInTimeStr = String(checkInTime);
      const checkOutTimeStr = checkOutTime ? String(checkOutTime) : null;
      
      // On Time: Check-in <= late_threshold
      if (checkInTimeStr <= lateThreshold) {
        onTimeCount++;
        console.log(`  → On Time (${checkInTimeStr} <= ${lateThreshold})`);
      } else {
        // Late: Check-in > late_threshold
        lateCount++;
        console.log(`  → Late (${checkInTimeStr} > ${lateThreshold})`);
      }
      
      // Early Departure: Has check-out AND check-out < early_departure_threshold
      if (checkOutTimeStr && checkOutTimeStr < earlyDepartureThreshold) {
        earlyDepartureCount++;
        console.log(`  → Early Departure (${checkOutTimeStr} < ${earlyDepartureThreshold})`);
      } else if (checkOutTimeStr) {
        console.log(`  → Normal Departure (${checkOutTimeStr} >= ${earlyDepartureThreshold})`);
      } else {
        console.log(`  → No check-out yet`);
      }
    });

    console.log('\n📊 Attendance Summary for Today:');
    console.log(`   Total Records: ${totalRecords[0].count}`);
    console.log(`   On Time (≤9:00): ${onTimeCount}`);
    console.log(`   Late (>9:00): ${lateCount}`);
    console.log(`   Early Departure (<17:00): ${earlyDepartureCount}`);
    console.log(`   Absent: ${users.length - totalRecords[0].count}`);

    console.log('\n✅ Attendance data added successfully!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addAttendanceData();

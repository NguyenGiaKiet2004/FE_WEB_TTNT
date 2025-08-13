const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function addTodayData() {
  let connection;
  
  try {
    console.log('📅 Adding today\'s attendance data...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    console.log(`Today: ${today}`);
    
    // Get all users (except super_admin)
    const [users] = await connection.execute('SELECT user_id FROM Users WHERE role != "super_admin"');
    console.log(`Found ${users.length} users to add attendance for`);
    
    if (users.length === 0) {
      console.log('❌ No users found! Please add some users first.');
      return;
    }
    
    // Check if today's data already exists
    const [existingData] = await connection.execute(
      'SELECT COUNT(*) as count FROM AttendanceRecords WHERE record_date = ?',
      [today]
    );
    
    if (existingData[0].count > 0) {
      console.log(`⚠️ Today's data already exists (${existingData[0].count} records)`);
      console.log('💡 Skipping data addition to avoid duplicates.');
      return;
    }
    
    // Add attendance records for each user
    let addedCount = 0;
    for (const user of users) {
      // Random status distribution
      const random = Math.random();
      let status, checkInTime, checkOutTime;
      
      if (random < 0.7) {
        // 70% on time
        status = 'on_time';
        checkInTime = `${today} 08:00:00`;
        checkOutTime = `${today} 17:00:00`;
      } else if (random < 0.85) {
        // 15% late
        status = 'late';
        const lateMinutes = Math.floor(Math.random() * 30) + 15;
        checkInTime = `${today} 08:${lateMinutes.toString().padStart(2, '0')}:00`;
        checkOutTime = `${today} 17:00:00`;
      } else if (random < 0.95) {
        // 10% absent
        status = 'absent';
        checkInTime = null;
        checkOutTime = null;
      } else {
        // 5% early departure
        status = 'early_departure';
        checkInTime = `${today} 08:00:00`;
        const earlyMinutes = Math.floor(Math.random() * 60) + 30;
        checkOutTime = `${today} 16:${earlyMinutes.toString().padStart(2, '0')}:00`;
      }
      
      await connection.execute(
        'INSERT INTO AttendanceRecords (user_id, check_in_time, check_out_time, status, record_date) VALUES (?, ?, ?, ?, ?)',
        [user.user_id, checkInTime, checkOutTime, status, today]
      );
      
      addedCount++;
    }
    
    console.log(`✅ Added ${addedCount} attendance records for today`);
    
    // Show summary
    const [summary] = await connection.execute(`
      SELECT 
        COUNT(CASE WHEN status = 'on_time' THEN 1 END) as on_time,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'early_departure' THEN 1 END) as early_departure
      FROM AttendanceRecords 
      WHERE record_date = ?
    `, [today]);
    
    console.log('\n📊 Today\'s Summary:');
    console.log(`  - On Time: ${summary[0].on_time}`);
    console.log(`  - Late: ${summary[0].late}`);
    console.log(`  - Absent: ${summary[0].absent}`);
    console.log(`  - Early Departure: ${summary[0].early_departure}`);
    
    console.log('\n🎉 Today\'s data added successfully!');
    console.log('💡 Now refresh your dashboard to see the updated stats.');
    
  } catch (error) {
    console.error('❌ Error adding today\'s data:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

addTodayData();

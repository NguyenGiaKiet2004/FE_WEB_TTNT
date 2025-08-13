const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function debugTimeFormat() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    
    // Get all records with detailed time info
    const [records] = await connection.execute(`
      SELECT 
        user_id,
        check_in_time,
        check_out_time,
        status,
        record_date,
        TIME(check_in_time) as check_in_time_only,
        TIME(check_out_time) as check_out_time_only
      FROM AttendanceRecords 
      WHERE record_date = ?
      ORDER BY user_id
    `, [today]);

    console.log(`\n🔍 Debug Time Format for ${today}:`);
    console.log('─'.repeat(100));
    
    records.forEach((record, index) => {
      console.log(`${index + 1}. User ID: ${record.user_id}`);
      console.log(`   Raw check_in_time: "${record.check_in_time}" (type: ${typeof record.check_in_time})`);
      console.log(`   Raw check_out_time: "${record.check_out_time}" (type: ${typeof record.check_out_time})`);
      console.log(`   TIME(check_in_time): "${record.check_in_time_only}"`);
      console.log(`   TIME(check_out_time): "${record.check_out_time_only}"`);
      console.log(`   Status: ${record.status}`);
      console.log('');
    });

    // Test comparison logic
    console.log('🧪 Testing Comparison Logic:');
    console.log('─'.repeat(100));
    
    records.forEach((record, index) => {
      const checkInTime = record.check_in_time;
      const checkOutTime = record.check_out_time;
      
      console.log(`${index + 1}. User ${record.user_id}:`);
      console.log(`   check_in_time: "${checkInTime}"`);
      console.log(`   check_in_time <= '09:00:00': ${checkInTime <= '09:00:00'}`);
      console.log(`   check_in_time > '09:00:00': ${checkInTime > '09:00:00'}`);
      
      if (checkOutTime) {
        console.log(`   check_out_time: "${checkOutTime}"`);
        console.log(`   check_out_time < '17:00:00': ${checkOutTime < '17:00:00'}`);
      } else {
        console.log(`   check_out_time: NULL`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugTimeFormat();

const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function checkTimeFormat() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    const today = new Date().toISOString().split('T')[0];
    
    // Get one record to check format
    const [records] = await connection.execute(`
      SELECT user_id, check_in_time, check_out_time
      FROM AttendanceRecords 
      WHERE record_date = ?
      LIMIT 1
    `, [today]);

    if (records.length > 0) {
      const record = records[0];
      console.log('\n🔍 Time Format Check:');
      console.log(`User ID: ${record.user_id}`);
      console.log(`check_in_time: "${record.check_in_time}" (type: ${typeof record.check_in_time})`);
      console.log(`check_out_time: "${record.check_out_time}" (type: ${typeof record.check_out_time})`);
      
      // Test comparisons
      console.log('\n🧪 Comparison Tests:');
      console.log(`'08:45:00' <= '09:00:00': ${'08:45:00' <= '09:00:00'}`);
      console.log(`'09:15:00' <= '09:00:00': ${'09:15:00' <= '09:00:00'}`);
      console.log(`'16:45:00' < '17:00:00': ${'16:45:00' < '17:00:00'}`);
      console.log(`'17:30:00' < '17:00:00': ${'17:30:00' < '17:00:00'}`);
      
      // Test with actual data
      const checkInTime = String(record.check_in_time);
      const checkOutTime = record.check_out_time ? String(record.check_out_time) : null;
      
      console.log('\n📊 Actual Data Tests:');
      console.log(`check_in_time (${checkInTime}) <= '09:00:00': ${checkInTime <= '09:00:00'}`);
      if (checkOutTime) {
        console.log(`check_out_time (${checkOutTime}) < '17:00:00': ${checkOutTime < '17:00:00'}`);
      }
    } else {
      console.log('❌ No records found for today');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTimeFormat();

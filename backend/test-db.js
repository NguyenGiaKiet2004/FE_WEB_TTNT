const mysql = require('mysql2/promise');

// Database connection
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function testDatabase() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully!');
    
    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));
    
    // Check Users table
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    console.log(`👥 Total users in database: ${users[0].count}`);
    
    if (users[0].count > 0) {
      // Show first few users
      const [userList] = await connection.execute('SELECT user_id, full_name, email, role FROM Users LIMIT 5');
      console.log('📝 Sample users:');
      userList.forEach(user => {
        console.log(`   - ${user.full_name} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('❌ No users found in database!');
      console.log('💡 Run: node seed-data.js to create sample data');
    }
    
    // Check Departments table
    const [departments] = await connection.execute('SELECT COUNT(*) as count FROM Departments');
    console.log(`🏢 Total departments in database: ${departments[0].count}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabase();

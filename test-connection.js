const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function testConnection() {
  let connection;
  
  try {
    console.log('🔗 Testing database connection...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully!');
    
    // Test basic queries
    console.log('\n📊 Testing basic queries...');
    
    // Test Departments table
    const [departments] = await connection.execute('SELECT COUNT(*) as count FROM Departments');
    console.log(`📁 Departments count: ${departments[0].count}`);
    
    // Test Users table
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM Users');
    console.log(`👥 Users count: ${users[0].count}`);
    
    // Test specific user
    const [adminUser] = await connection.execute('SELECT * FROM Users WHERE email = ?', ['admin@company.com']);
    if (adminUser.length > 0) {
      console.log(`✅ Admin user found: ${adminUser[0].full_name}`);
    } else {
      console.log('❌ Admin user not found');
    }
    
    console.log('\n🎉 Database connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

testConnection();

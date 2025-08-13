const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function checkDatabase() {
  let connection;
  
  try {
    console.log('🔍 Checking current database state...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database successfully!');
    
    // Check what tables exist
    console.log('\n📋 Checking existing tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tables found:', tables.map(t => Object.values(t)[0]));
    
    // Check Departments
    if (tables.some(t => Object.values(t)[0] === 'Departments')) {
      const [departments] = await connection.execute('SELECT * FROM Departments');
      console.log(`\n📁 Departments (${departments.length}):`);
      departments.forEach(dept => {
        console.log(`  - ID: ${dept.department_id}, Name: ${dept.department_name}`);
      });
    }
    
    // Check Users
    if (tables.some(t => Object.values(t)[0] === 'Users')) {
      const [users] = await connection.execute('SELECT user_id, full_name, email, role, department_id FROM Users');
      console.log(`\n👥 Users (${users.length}):`);
      users.forEach(user => {
        console.log(`  - ID: ${user.user_id}, Name: ${user.full_name}, Email: ${user.email}, Role: ${user.role}`);
      });
    }
    
    // Check SystemConfigs
    if (tables.some(t => Object.values(t)[0] === 'SystemConfigs')) {
      const [configs] = await connection.execute('SELECT * FROM SystemConfigs');
      console.log(`\n⚙️ System Configs (${configs.length}):`);
      configs.forEach(config => {
        console.log(`  - ${config.config_key}: ${config.config_value}`);
      });
    }
    
    console.log('\n🎉 Database check completed!');
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkDatabase();

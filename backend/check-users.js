const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function checkUsers() {
  let connection;
  
  try {
    console.log('🔍 Checking users in database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // Check all users
    console.log('\n👥 All users in database:');
    const [users] = await connection.execute(`
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.phone_number,
        d.department_name
      FROM Users u
      LEFT JOIN Departments d ON u.department_id = d.department_id
      ORDER BY u.user_id DESC
    `);
    
    console.log(`Found ${users.length} users:`);
    console.log('┌─────┬─────────────────┬─────────────────────┬─────────────┬─────────────────┬─────────────────┐');
    console.log('│ ID  │ Full Name       │ Email               │ Role        │ Phone           │ Department      │');
    console.log('├─────┼─────────────────┼─────────────────────┼─────────────┼─────────────────┼─────────────────┤');
    
    users.forEach(user => {
      const id = user.user_id.toString().padStart(3);
      const name = (user.full_name || '').padEnd(15);
      const email = (user.email || '').padEnd(19);
      const role = (user.role || '').padEnd(11);
      const phone = (user.phone_number || '').padEnd(15);
      const dept = (user.department_name || '').padEnd(15);
      
      console.log(`│ ${id} │ ${name} │ ${email} │ ${role} │ ${phone} │ ${dept} │`);
    });
    
    console.log('└─────┴─────────────────┴─────────────────────┴─────────────┴─────────────────┴─────────────────┘');
    
    // Check latest user (most recently added)
    if (users.length > 0) {
      const latestUser = users[0];
      console.log(`\n🆕 Latest user added:`);
      console.log(`  - ID: ${latestUser.user_id}`);
      console.log(`  - Name: ${latestUser.full_name}`);
      console.log(`  - Email: ${latestUser.email}`);
      console.log(`  - Role: ${latestUser.role}`);
      console.log(`  - Phone: ${latestUser.phone_number}`);
      console.log(`  - Department: ${latestUser.department_name}`);
    }
    
    console.log('\n🎉 User check completed!');
    
  } catch (error) {
    console.error('❌ User check failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

checkUsers();

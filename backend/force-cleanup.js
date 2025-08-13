const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function forceCleanup() {
  let connection;
  
  try {
    console.log('🧹 Starting FORCE database cleanup...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // 1. Check current departments
    console.log('\n📋 Current departments:');
    const [departments] = await connection.execute('SELECT * FROM Departments ORDER BY department_id');
    console.log(`Found ${departments.length} departments`);
    departments.forEach(dept => {
      console.log(`  - ID: ${dept.department_id}, Name: ${dept.department_name}`);
    });
    
    // 2. Create temporary table with unique departments
    console.log('\n🔄 Creating temporary table...');
    await connection.execute(`
      CREATE TEMPORARY TABLE temp_departments AS
      SELECT MIN(department_id) as department_id, department_name
      FROM Departments
      GROUP BY department_name
    `);
    
    // 3. Delete all departments
    console.log('\n🗑️ Deleting all departments...');
    await connection.execute('DELETE FROM Departments');
    
    // 4. Re-insert unique departments
    console.log('\n📝 Re-inserting unique departments...');
    await connection.execute(`
      INSERT INTO Departments (department_id, department_name)
      SELECT department_id, department_name FROM temp_departments
    `);
    
    // 5. Reset auto increment
    console.log('\n🔄 Resetting auto increment...');
    await connection.execute('ALTER TABLE Departments AUTO_INCREMENT = 1');
    
    // 6. Check result
    console.log('\n📋 Departments after FORCE cleanup:');
    const [cleanDepartments] = await connection.execute('SELECT * FROM Departments ORDER BY department_id');
    console.log(`Remaining: ${cleanDepartments.length} departments`);
    cleanDepartments.forEach(dept => {
      console.log(`  - ID: ${dept.department_id}, Name: ${dept.department_name}`);
    });
    
    console.log('\n🎉 FORCE cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ FORCE cleanup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

forceCleanup();

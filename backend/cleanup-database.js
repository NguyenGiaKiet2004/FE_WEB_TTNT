const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function cleanupDatabase() {
  let connection;
  
  try {
    console.log('🧹 Starting database cleanup...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');
    
    // 1. Check current departments
    console.log('\n📋 Current departments:');
    const [departments] = await connection.execute('SELECT * FROM Departments ORDER BY department_id');
    console.log(`Found ${departments.length} departments`);
    departments.forEach(dept => {
      console.log(`  - ID: ${dept.department_id}, Name: ${dept.department_name}`);
    });
    
    // 2. Find duplicates
    console.log('\n🔍 Finding duplicates...');
    const [duplicates] = await connection.execute(`
      SELECT department_name, COUNT(*) as count
      FROM Departments 
      GROUP BY department_name 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!');
      return;
    }
    
    console.log(`Found ${duplicates.length} duplicate department names:`);
    duplicates.forEach(dup => {
      console.log(`  - "${dup.department_name}": ${dup.count} times`);
    });
    
    // 3. Keep only the first occurrence of each department name
    console.log('\n🗑️ Removing duplicates...');
    for (const dup of duplicates) {
      const [toDelete] = await connection.execute(`
        SELECT department_id 
        FROM Departments 
        WHERE department_name = ? 
        ORDER BY department_id 
        LIMIT 1 OFFSET 1
      `, [dup.department_name]);
      
      if (toDelete.length > 0) {
        const deleteIds = toDelete.map(d => d.department_id);
        console.log(`Deleting duplicate IDs for "${dup.department_name}": ${deleteIds.join(', ')}`);
        
        // Delete duplicate departments
        await connection.execute(`
          DELETE FROM Departments 
          WHERE department_id IN (${deleteIds.map(() => '?').join(',')})
        `, deleteIds);
      }
    }
    
    // 4. Check result
    console.log('\n📋 Departments after cleanup:');
    const [cleanDepartments] = await connection.execute('SELECT * FROM Departments ORDER BY department_id');
    console.log(`Remaining: ${cleanDepartments.length} departments`);
    cleanDepartments.forEach(dept => {
      console.log(`  - ID: ${dept.department_id}, Name: ${dept.department_name}`);
    });
    
    console.log('\n🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

cleanupDatabase();

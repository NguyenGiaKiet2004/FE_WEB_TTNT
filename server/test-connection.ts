import mysql from 'mysql2/promise';

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('🔗 Testing MySQL connection...');
    
    // Tạo kết nối
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Default XAMPP MySQL password
      database: 'face_attendance_system',
      port: 3306
    });

    console.log('✅ Connected to MySQL successfully!');

    // Test ping
    await connection.ping();
    console.log('✅ Database ping successful!');

    // Test query - lấy danh sách bảng
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'face_attendance_system'
    `);
    
    console.log('📋 Database tables:');
    (tables as any[]).forEach((table: any) => {
      console.log(`  - ${table.TABLE_NAME}`);
    });

    // Test query - đếm số lượng records trong mỗi bảng
    console.log('\n📊 Records count:');
    
    const tableNames = ['users', 'departments', 'roles', 'employees', 'attendance_records', 'system_settings'];
    
    for (const tableName of tableNames) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = (result as any[])[0]?.count || 0;
        console.log(`  - ${tableName}: ${count} records`);
      } catch (error) {
        console.log(`  - ${tableName}: Table not found or error`);
      }
    }

    // Test insert và select
    console.log('\n🧪 Testing CRUD operations...');
    
    // Test insert department
    const testDeptName = 'Test Department ' + Date.now();
    await connection.execute(`
      INSERT INTO departments (name, description) 
      VALUES (?, ?)
    `, [testDeptName, 'Test department for connection testing']);
    
    console.log('✅ Insert test successful');

    // Test select
    const [deptResult] = await connection.execute(`
      SELECT * FROM departments WHERE name = ?
    `, [testDeptName]);
    
    console.log('✅ Select test successful');
    console.log(`  Found department: ${(deptResult as any[])[0]?.name}`);

    // Clean up test data
    await connection.execute(`
      DELETE FROM departments WHERE name = ?
    `, [testDeptName]);
    
    console.log('✅ Delete test successful');

    console.log('\n🎉 All database tests passed!');
    console.log('✅ Database connection is working perfectly!');

  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', {
      message: (error as any).message,
      code: (error as any).code,
      errno: (error as any).errno
    });
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Chạy test
testDatabaseConnection().catch(console.error);

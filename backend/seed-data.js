const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'smart_attendance',
  port: 3306
};

async function seedData() {
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!');

    // 1. Insert Departments
    console.log('📁 Inserting departments...');
    const departments = [
      { name: 'IT Department', description: 'Phòng Kỹ thuật' },
      { name: 'Human Resources', description: 'Phòng Nhân sự' },
      { name: 'Finance', description: 'Phòng Tài chính' },
      { name: 'Marketing', description: 'Phòng Marketing' },
      { name: 'Operations', description: 'Phòng Vận hành' },
      { name: 'Sales', description: 'Phòng Kinh doanh' },
      { name: 'Customer Service', description: 'Phòng Chăm sóc khách hàng' }
    ];

    for (const dept of departments) {
      await connection.execute(
        'INSERT IGNORE INTO Departments (department_name) VALUES (?)',
        [dept.name]
      );
    }
    console.log(`✅ Inserted ${departments.length} departments`);

    // 2. Insert Users with hashed passwords
    console.log('👥 Inserting users...');
    const users = [
      {
        fullName: 'Admin User',
        email: 'admin@company.com',
        password: 'Admin123',
        role: 'super_admin',
        departmentId: 1,
        phoneNumber: '0123456789'
      },
      {
        fullName: 'HR Manager',
        email: 'hr@company.com',
        password: 'Hr123',
        role: 'hr_manager',
        departmentId: 2,
        phoneNumber: '0987654321'
      },
      {
        fullName: 'IT Employee',
        email: 'it@company.com',
        password: 'It123',
        role: 'employee',
        departmentId: 1,
        phoneNumber: '0555666777'
      },
      {
        fullName: 'Finance Employee',
        email: 'finance@company.com',
        password: 'Finance123',
        role: 'employee',
        departmentId: 3,
        phoneNumber: '0333444555'
      },
      {
        fullName: 'Marketing Employee',
        email: 'marketing@company.com',
        password: 'Marketing123',
        role: 'employee',
        departmentId: 4,
        phoneNumber: '0444555666'
      }
    ];

    for (const user of users) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      
      await connection.execute(
        'INSERT INTO Users (full_name, email, password_hash, role, department_id, phone_number) VALUES (?, ?, ?, ?, ?, ?)',
        [user.fullName, user.email, hashedPassword, user.role, user.departmentId, user.phoneNumber]
      );
    }
    console.log(`✅ Inserted ${users.length} users`);

    // 3. Insert System Configs
    console.log('⚙️ Inserting system configs...');
    const configs = [
      { key: 'WORK_START_TIME', value: '08:00', description: 'Thời gian bắt đầu làm việc' },
      { key: 'WORK_END_TIME', value: '17:00', description: 'Thời gian kết thúc làm việc' },
      { key: 'LATE_THRESHOLD', value: '15', description: 'Số phút muộn cho phép (phút)' },
      { key: 'FACE_RECOGNITION_THRESHOLD', value: '0.6', description: 'Ngưỡng nhận diện khuôn mặt' },
      { key: 'MAX_ATTENDANCE_DAYS', value: '365', description: 'Số ngày lưu trữ bản ghi chấm công' },
      { key: 'SYSTEM_NAME', value: 'Hệ Thống Chấm Công Khuôn Mặt Thông Minh', description: 'Tên hệ thống' },
      { key: 'COMPANY_NAME', value: 'Công Ty ABC', description: 'Tên công ty' }
    ];

    for (const config of configs) {
      await connection.execute(
        'INSERT INTO SystemConfigs (config_key, config_value, description) VALUES (?, ?, ?)',
        [config.key, config.value, config.description]
      );
    }
    console.log(`✅ Inserted ${configs.length} system configs`);

    // 4. Insert Sample Attendance Records (last 7 days)
    console.log('📅 Inserting sample attendance records...');
    const today = new Date();
    const attendanceData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // Generate random attendance for each user
      for (let userId = 1; userId <= 5; userId++) {
        const status = Math.random() > 0.2 ? 'on_time' : (Math.random() > 0.5 ? 'late' : 'absent');
        let checkInTime = null;
        let checkOutTime = null;

        if (status !== 'absent') {
          if (status === 'on_time') {
            checkInTime = `${dateStr} 08:00:00`;
          } else {
            checkInTime = `${dateStr} 08:${Math.floor(Math.random() * 30) + 15}:00`;
          }
          checkOutTime = `${dateStr} 17:00:00`;
        }

        attendanceData.push({
          userId,
          checkInTime,
          checkOutTime,
          status,
          recordDate: dateStr
        });
      }
    }

    for (const record of attendanceData) {
      await connection.execute(
        'INSERT INTO AttendanceRecords (user_id, check_in_time, check_out_time, status, record_date) VALUES (?, ?, ?, ?, ?)',
        [record.userId, record.checkInTime, record.checkOutTime, record.status, record.recordDate]
      );
    }
    console.log(`✅ Inserted ${attendanceData.length} attendance records`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📋 Sample accounts for testing:');
         console.log('┌─────────────────────┬─────────────────┬─────────────┬─────────────┐');
     console.log('│ Email               │ Password        │ Role        │ Department  │');
     console.log('├─────────────────────┼─────────────────┼─────────────┼─────────────┤');
     console.log('│ admin@company.com   │ Admin123        │ Super Admin │ IT          │');
     console.log('│ hr@company.com      │ Hr123           │ HR Manager  │ HR          │');
     console.log('│ it@company.com      │ It123           │ Employee    │ IT          │');
     console.log('│ finance@company.com │ Finance123      │ Employee    │ Finance     │');
     console.log('│ marketing@company.com│ Marketing123    │ Employee    │ Marketing   │');
     console.log('└─────────────────────┴─────────────────┴─────────────┴─────────────┘');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = { seedData };


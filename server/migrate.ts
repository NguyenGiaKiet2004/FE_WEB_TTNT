import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';

async function createDatabase() {
  try {
    // Connect to MySQL without specifying database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Default XAMPP MySQL password
      port: 3306
    });

    console.log('🔗 Connecting to MySQL...');

    // Create database if not exists
    await connection.query('CREATE DATABASE IF NOT EXISTS face_attendance_system');
    console.log('✅ Database "face_attendance_system" created/verified');

    // Use the database
    await connection.query('USE face_attendance_system');

    // Create Drizzle instance
    const db = drizzle(connection, { schema, mode: 'default' });

    // Create tables
    console.log('📋 Creating tables...');

    // Create departments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        name TEXT NOT NULL,
        description TEXT,
        manager TEXT,
        employee_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create roles table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        name TEXT NOT NULL,
        description TEXT,
        department_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      )
    `);

    // Create employees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        employee_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT,
        department_id VARCHAR(255),
        role_id VARCHAR(255),
        status TEXT DEFAULT 'active',
        face_images JSON DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id),
        FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    // Create attendance_records table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        employee_id VARCHAR(255),
        date TEXT NOT NULL,
        check_in TEXT,
        check_out TEXT,
        working_hours TEXT,
        status TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id)
      )
    `);

    // Create system_settings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        work_start_time TEXT DEFAULT '08:00',
        work_end_time TEXT DEFAULT '17:00',
        lunch_start_time TEXT DEFAULT '12:00',
        lunch_end_time TEXT DEFAULT '13:00',
        grace_period_minutes INT DEFAULT 5,
        max_late_period_minutes INT DEFAULT 60,
        recognition_threshold TEXT DEFAULT '0.85',
        min_training_images INT DEFAULT 2,
        email_notifications BOOLEAN DEFAULT TRUE,
        daily_reports BOOLEAN DEFAULT TRUE,
        weekly_reports BOOLEAN DEFAULT FALSE
      )
    `);

    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT UNIQUE,
        role TEXT DEFAULT 'user',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
        session_id TEXT NOT NULL UNIQUE,
        user_id VARCHAR(255),
        expires TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    console.log('✅ All tables created successfully!');

    // Insert default admin user
    const adminPassword = '$2b$10$DjpD0.DNuaA8MdIiM7.EZeaBU2Kfc44ok9PCuJD3RuaRPEF0UGCDK'; // admin123
    await connection.query(`
      INSERT IGNORE INTO users (username, password, email, role) 
      VALUES (?, ?, ?, ?)
    `, ['admin', adminPassword, 'admin@example.com', 'admin']);

    console.log('✅ Default admin user created (username: admin, password: admin123)');

    // Insert sample data
    await connection.query(`
      INSERT IGNORE INTO departments (name, description, manager) 
      VALUES (?, ?, ?)
    `, ['IT Department', 'Information Technology', 'John Doe']);

    await connection.query(`
      INSERT IGNORE INTO roles (name, description) 
      VALUES (?, ?)
    `, ['Developer', 'Software Developer']);

    console.log('✅ Sample data inserted');

    await connection.end();
    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

// Run migration
createDatabase().catch(console.error);

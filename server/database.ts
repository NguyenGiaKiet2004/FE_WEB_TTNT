import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '@shared/schema';

// Database connection configuration
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // Default XAMPP MySQL password is empty
  database: 'face_attendance_system',
  port: 3306
});

// Create Drizzle instance
export const db = drizzle(connection, { schema });

// Test connection
export async function testConnection() {
  try {
    await connection.ping();
    console.log('✅ MySQL connection successful!');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}

// Close connection
export async function closeConnection() {
  await connection.end();
}

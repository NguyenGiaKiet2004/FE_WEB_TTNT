import { sql } from "drizzle-orm";
import { mysqlTable, text, varchar, timestamp, boolean, int, json, index } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const departments = mysqlTable("departments", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description"),
  manager: text("manager"),
  employeeCount: int("employee_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roles = mysqlTable("roles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description"),
  departmentId: varchar("department_id", { length: 255 }).references(() => departments.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const employees = mysqlTable("employees", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  departmentId: varchar("department_id", { length: 255 }).references(() => departments.id),
  roleId: varchar("role_id", { length: 255 }).references(() => roles.id),
  status: text("status").default("active"),
  faceImages: json("face_images").default([]),
  createdAt: timestamp("created_at").defaultNow(),
});

export const attendanceRecords = mysqlTable("attendance_records", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  employeeId: varchar("employee_id", { length: 255 }).references(() => employees.id),
  date: text("date").notNull(),
  checkIn: text("check_in"),
  checkOut: text("check_out"),
  workingHours: text("working_hours"),
  status: text("status"), // present, absent, late, early_departure
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = mysqlTable("system_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  workStartTime: text("work_start_time").default("08:00"),
  workEndTime: text("work_end_time").default("17:00"),
  lunchStartTime: text("lunch_start_time").default("12:00"),
  lunchEndTime: text("lunch_end_time").default("13:00"),
  gracePeriodMinutes: int("grace_period_minutes").default(5),
  maxLatePeriodMinutes: int("max_late_period_minutes").default(60),
  recognitionThreshold: text("recognition_threshold").default("0.85"),
  minTrainingImages: int("min_training_images").default(2),
  emailNotifications: boolean("email_notifications").default(true),
  dailyReports: boolean("daily_reports").default(true),
  weeklyReports: boolean("weekly_reports").default(false),
});

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  role: text("role").default("user"),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  sessionId: text("session_id").notNull().unique(),
  userId: varchar("user_id", { length: 255 }).references(() => users.id),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  employeeCount: true,
});

export const insertRoleSchema = createInsertSchema(roles).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export const insertAttendanceSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
  createdAt: true,
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceSchema>;

export type SystemSettings = typeof systemSettings.$inferSelect;
export type InsertSystemSettings = z.infer<typeof insertSystemSettingsSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;

export type LoginRequest = z.infer<typeof loginSchema>;

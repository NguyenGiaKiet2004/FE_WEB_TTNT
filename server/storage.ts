import { 
  type User, 
  type InsertUser,
  type Department,
  type InsertDepartment,
  type Role,
  type InsertRole,
  type Employee,
  type InsertEmployee,
  type AttendanceRecord,
  type InsertAttendanceRecord,
  type SystemSettings,
  type InsertSystemSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;

  // Department methods
  getDepartments(): Promise<Department[]>;
  getDepartment(id: string): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined>;
  deleteDepartment(id: string): Promise<boolean>;

  // Role methods
  getRoles(): Promise<Role[]>;
  getRole(id: string): Promise<Role | undefined>;
  getRolesByDepartment(departmentId: string): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined>;
  deleteRole(id: string): Promise<boolean>;

  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Attendance methods
  getAttendanceRecords(): Promise<AttendanceRecord[]>;
  getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined>;
  getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]>;
  getAttendanceByDate(date: string): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  updateAttendanceRecord(id: string, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined>;

  // Settings methods
  getSystemSettings(): Promise<SystemSettings | undefined>;
  updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private departments: Map<string, Department>;
  private roles: Map<string, Role>;
  private employees: Map<string, Employee>;
  private attendanceRecords: Map<string, AttendanceRecord>;
  private systemSettings: SystemSettings | undefined;

  constructor() {
    this.users = new Map();
    this.departments = new Map();
    this.roles = new Map();
    this.employees = new Map();
    this.attendanceRecords = new Map();
    
    // Initialize with default system settings
    this.systemSettings = {
      id: randomUUID(),
      workStartTime: "08:00",
      workEndTime: "17:00",
      lunchStartTime: "12:00",
      lunchEndTime: "13:00",
      gracePeriodMinutes: 5,
      maxLatePeriodMinutes: 60,
      recognitionThreshold: "0.85",
      minTrainingImages: 2,
      emailNotifications: true,
      dailyReports: true,
      weeklyReports: false,
    };

    // Seed some initial data
    this.seedData();
  }

  private seedData() {
    // Create default admin user
    const defaultAdmin: User = {
      id: randomUUID(),
      username: "admin",
      password: "$2b$10$DjpD0.DNuaA8MdIiM7.EZeaBU2Kfc44ok9PCuJD3RuaRPEF0UGCDK", // password: admin123
      fullName: "System Administrator",
      email: "admin@company.com",
      role: "admin",
      isActive: true,
      lastLogin: null,
      createdAt: new Date(),
    };
    this.users.set(defaultAdmin.id, defaultAdmin);

    // Create departments
    const itDept: Department = {
      id: randomUUID(),
      name: "IT Department",
      description: "Information Technology and Software Development",
      manager: "John Smith",
      employeeCount: 45,
      createdAt: new Date(),
    };
    
    const hrDept: Department = {
      id: randomUUID(),
      name: "HR Department", 
      description: "Human Resources and Employee Relations",
      manager: "Jane Doe",
      employeeCount: 12,
      createdAt: new Date(),
    };
    
    const financeDept: Department = {
      id: randomUUID(),
      name: "Finance Department",
      description: "Financial Planning and Accounting",
      manager: "Mike Johnson",
      employeeCount: 18,
      createdAt: new Date(),
    };

    this.departments.set(itDept.id, itDept);
    this.departments.set(hrDept.id, hrDept);
    this.departments.set(financeDept.id, financeDept);

    // Create roles
    const roles = [
      { name: "Software Developer", description: "Develops software applications", departmentId: itDept.id },
      { name: "System Administrator", description: "Manages IT infrastructure", departmentId: itDept.id },
      { name: "HR Manager", description: "Manages human resources", departmentId: hrDept.id },
      { name: "Recruiter", description: "Recruits new employees", departmentId: hrDept.id },
      { name: "Accountant", description: "Manages financial records", departmentId: financeDept.id },
      { name: "Financial Analyst", description: "Analyzes financial data", departmentId: financeDept.id },
    ];

    roles.forEach(roleData => {
      const role: Role = {
        id: randomUUID(),
        ...roleData,
        createdAt: new Date(),
      };
      this.roles.set(role.id, role);
    });

    // Create sample employees
    const sampleEmployees = [
      {
        employeeId: "EMP001",
        name: "Nguyễn Văn An",
        email: "an.nguyen@company.com",
        phone: "0123456789",
        departmentId: itDept.id,
        roleId: Array.from(this.roles.values()).find(r => r.name === "Software Developer")?.id,
        status: "active",
        faceImages: [],
      },
      {
        employeeId: "EMP002",
        name: "Trần Thị Bình",
        email: "binh.tran@company.com",
        phone: "0987654321",
        departmentId: hrDept.id,
        roleId: Array.from(this.roles.values()).find(r => r.name === "HR Manager")?.id,
        status: "active",
        faceImages: [],
      },
    ];

    sampleEmployees.forEach(empData => {
      const employee: Employee = {
        id: randomUUID(),
        ...empData,
        createdAt: new Date(),
      };
      this.employees.set(employee.id, employee);
    });

    // Create sample attendance records
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const attendanceData = [
      {
        employeeId: Array.from(this.employees.values())[0]?.id,
        date: today,
        checkIn: "08:00",
        checkOut: "17:30",
        workingHours: "8h 30m",
        status: "present",
        notes: "On time",
      },
      {
        employeeId: Array.from(this.employees.values())[1]?.id,
        date: today,
        checkIn: "08:15",
        checkOut: "17:45",
        workingHours: "8h 30m",
        status: "late",
        notes: "15 minutes late",
      },
    ];

    attendanceData.forEach(attData => {
      if (attData.employeeId) {
        const record: AttendanceRecord = {
          id: randomUUID(),
          ...attData,
          createdAt: new Date(),
        };
        this.attendanceRecords.set(record.id, record);
      }
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      lastLogin: null,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.users.set(id, user);
    }
  }

  // Department methods
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async getDepartment(id: string): Promise<Department | undefined> {
    return this.departments.get(id);
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const id = randomUUID();
    const newDepartment: Department = {
      ...department,
      id,
      employeeCount: 0,
      createdAt: new Date(),
    };
    this.departments.set(id, newDepartment);
    return newDepartment;
  }

  async updateDepartment(id: string, department: Partial<InsertDepartment>): Promise<Department | undefined> {
    const existing = this.departments.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...department };
    this.departments.set(id, updated);
    return updated;
  }

  async deleteDepartment(id: string): Promise<boolean> {
    return this.departments.delete(id);
  }

  // Role methods
  async getRoles(): Promise<Role[]> {
    return Array.from(this.roles.values());
  }

  async getRole(id: string): Promise<Role | undefined> {
    return this.roles.get(id);
  }

  async getRolesByDepartment(departmentId: string): Promise<Role[]> {
    return Array.from(this.roles.values()).filter(role => role.departmentId === departmentId);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const id = randomUUID();
    const newRole: Role = {
      ...role,
      id,
      createdAt: new Date(),
    };
    this.roles.set(id, newRole);
    return newRole;
  }

  async updateRole(id: string, role: Partial<InsertRole>): Promise<Role | undefined> {
    const existing = this.roles.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...role };
    this.roles.set(id, updated);
    return updated;
  }

  async deleteRole(id: string): Promise<boolean> {
    return this.roles.delete(id);
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    return Array.from(this.employees.values()).find(emp => emp.employeeId === employeeId);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const newEmployee: Employee = {
      ...employee,
      id,
      createdAt: new Date(),
    };
    this.employees.set(id, newEmployee);
    
    // Update department employee count
    if (employee.departmentId) {
      const dept = this.departments.get(employee.departmentId);
      if (dept) {
        dept.employeeCount = (dept.employeeCount || 0) + 1;
        this.departments.set(employee.departmentId, dept);
      }
    }
    
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...employee };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const employee = this.employees.get(id);
    if (!employee) return false;

    // Update department employee count
    if (employee.departmentId) {
      const dept = this.departments.get(employee.departmentId);
      if (dept && dept.employeeCount > 0) {
        dept.employeeCount = dept.employeeCount - 1;
        this.departments.set(employee.departmentId, dept);
      }
    }

    return this.employees.delete(id);
  }

  // Attendance methods
  async getAttendanceRecords(): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values());
  }

  async getAttendanceRecord(id: string): Promise<AttendanceRecord | undefined> {
    return this.attendanceRecords.get(id);
  }

  async getAttendanceByEmployee(employeeId: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(record => record.employeeId === employeeId);
  }

  async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(record => record.date === date);
  }

  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = randomUUID();
    const newRecord: AttendanceRecord = {
      ...record,
      id,
      createdAt: new Date(),
    };
    this.attendanceRecords.set(id, newRecord);
    return newRecord;
  }

  async updateAttendanceRecord(id: string, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const existing = this.attendanceRecords.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...record };
    this.attendanceRecords.set(id, updated);
    return updated;
  }

  // Settings methods
  async getSystemSettings(): Promise<SystemSettings | undefined> {
    return this.systemSettings;
  }

  async updateSystemSettings(settings: Partial<InsertSystemSettings>): Promise<SystemSettings> {
    if (!this.systemSettings) {
      this.systemSettings = {
        id: randomUUID(),
        workStartTime: "08:00",
        workEndTime: "17:00",
        lunchStartTime: "12:00",
        lunchEndTime: "13:00",
        gracePeriodMinutes: 5,
        maxLatePeriodMinutes: 60,
        recognitionThreshold: "0.85",
        minTrainingImages: 2,
        emailNotifications: true,
        dailyReports: true,
        weeklyReports: false,
      };
    }

    this.systemSettings = { ...this.systemSettings, ...settings };
    return this.systemSettings;
  }
}

export const storage = new MemStorage();

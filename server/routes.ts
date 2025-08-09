import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDepartmentSchema, insertRoleSchema, insertEmployeeSchema, insertAttendanceSchema, insertSystemSettingsSchema, loginSchema } from "@shared/schema";
import { setupSession, authenticateUser, requireAuth, getCurrentUser } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  setupSession(app);

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ 
          message: "Invalid username or password",
          authenticated: false 
        });
      }

      // Set session
      req.session.userId = user.id;
      req.session.user = user;
      req.session.isAuthenticated = true;

      // Return user info (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        message: "Login successful",
        authenticated: true,
        user: userWithoutPassword 
      });
    } catch (error) {
      res.status(400).json({ 
        message: "Invalid login data",
        authenticated: false 
      });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ 
        message: "Logout successful",
        authenticated: false 
      });
    });
  });

  app.get("/api/auth/me", getCurrentUser, (req, res) => {
    if (req.session?.isAuthenticated && req.session?.user) {
      const { password: _, ...userWithoutPassword } = req.session.user;
      res.json({ 
        authenticated: true,
        user: userWithoutPassword 
      });
    } else {
      res.json({ 
        authenticated: false,
        user: null 
      });
    }
  });

  // Dashboard stats endpoint (protected)
  app.get("/api/dashboard/stats", requireAuth, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await storage.getAttendanceByDate(today);

      const totalEmployees = employees.length;
      const presentEmployees = todayAttendance.filter(a => a.status === "present").length;
      const onTimeEmployees = todayAttendance.filter(a => a.status === "present" && !a.notes?.includes("late")).length;
      const lateEmployees = todayAttendance.filter(a => a.status === "late").length;
      const absentEmployees = totalEmployees - presentEmployees - lateEmployees;
      const earlyDepartureEmployees = todayAttendance.filter(a => a.notes?.includes("early")).length;
      const timeOffEmployees = todayAttendance.filter(a => a.status === "time_off").length;

      res.json({
        totalEmployees,
        onTime: onTimeEmployees,
        absent: absentEmployees,
        lateArrival: lateEmployees,
        earlyDeparture: earlyDepartureEmployees,
        timeOff: timeOffEmployees
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Department routes (protected)
  app.get("/api/departments", requireAuth, async (req, res) => {
    try {
      const departments = await storage.getDepartments();
      res.json(departments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post("/api/departments", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.put("/api/departments/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.partial().parse(req.body);
      const department = await storage.updateDepartment(req.params.id, validatedData);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.json(department);
    } catch (error) {
      res.status(400).json({ message: "Invalid department data" });
    }
  });

  app.delete("/api/departments/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteDepartment(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Department not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete department" });
    }
  });

  // Role routes (protected)
  app.get("/api/roles", requireAuth, async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ message: "Invalid role data" });
    }
  });

  app.put("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(req.params.id, validatedData);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.json(role);
    } catch (error) {
      res.status(400).json({ message: "Invalid role data" });
    }
  });

  app.delete("/api/roles/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteRole(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Role not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete role" });
    }
  });

  // Employee routes (protected)
  app.get("/api/employees", requireAuth, async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const departments = await storage.getDepartments();
      const roles = await storage.getRoles();
      
      const employeesWithDetails = employees.map(emp => ({
        ...emp,
        department: departments.find(d => d.id === emp.departmentId),
        role: roles.find(r => r.id === emp.roleId)
      }));
      
      res.json(employeesWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/employees", requireAuth, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.put("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Invalid employee data" });
    }
  });

  app.delete("/api/employees/:id", requireAuth, async (req, res) => {
    try {
      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Attendance routes (protected)
  app.get("/api/attendance", requireAuth, async (req, res) => {
    try {
      const records = await storage.getAttendanceRecords();
      const employees = await storage.getEmployees();
      
      const recordsWithEmployees = records.map(record => ({
        ...record,
        employee: employees.find(emp => emp.id === record.employeeId)
      }));
      
      res.json(recordsWithEmployees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance records" });
    }
  });

  app.post("/api/attendance", requireAuth, async (req, res) => {
    try {
      const validatedData = insertAttendanceSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid attendance data" });
    }
  });

  // Settings routes (protected)
  app.get("/api/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getSystemSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertSystemSettingsSchema.parse(req.body);
      const settings = await storage.updateSystemSettings(validatedData);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

# Arnifi - Smart Face Recognition Attendance System

## Overview

Arnifi is a modern web-based attendance management system that leverages face recognition technology for smart employee tracking. The application provides comprehensive tools for managing employees, departments, roles, and attendance records through an intuitive dashboard interface. Built with a full-stack TypeScript architecture, it combines a React frontend with an Express backend and MySQL database for robust data management.

## User Preferences

Preferred communication style: Simple, everyday language.
Interface Language: English (changed from Vietnamese on 2025-01-08)

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type-safe component development
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Comprehensive set of accessible components from Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework for RESTful API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful endpoints organized around core entities (employees, departments, roles, attendance)
- **Middleware**: Express middleware for JSON parsing, CORS handling, and request logging
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Database Layer
- **Database**: MySQL with local development setup (XAMPP) for scalable data storage
- **ORM**: Drizzle ORM for type-safe database operations and migrations
- **Schema Management**: Centralized schema definitions with Zod validation integration
- **Connection**: MySQL2 driver with connection pooling for optimal performance

### Data Storage Solutions
- **Primary Storage**: MySQL for all business data (employees, departments, roles, attendance)
- **Face Recognition Data**: JSON arrays stored in employee records for face image metadata
- **Session Management**: Memory-based sessions for user authentication (can be upgraded to MySQL sessions)
- **File Storage**: Prepared for face image storage through attached_assets directory

### Authentication and Authorization
- **Session-based Authentication**: Server-side sessions with express-session middleware
- **Password Security**: Bcrypt password hashing with salt rounds
- **Cookie Management**: Secure HTTP-only cookies for session persistence
- **Route Protection**: Client-side route guards with server-side validation using requireAuth middleware
- **User Management**: Admin user system with role-based access control
- **Authentication Flow**: Login page → Session creation → Protected routes access
- **Default Credentials**: Username: admin, Password: admin123 (for development)

### External Dependencies
- **Database Hosting**: Local MySQL (XAMPP) for development, ready for production MySQL server
- **Face Recognition**: Framework prepared for integration with face recognition APIs
- **Email Services**: Ready for integration with email providers for notifications
- **File Upload**: Configured for image upload and processing capabilities
- **Development Tools**: Cross-platform compatibility with Windows, Linux, and macOS

### Core Features Architecture
- **Authentication System**: Secure admin login with session management and logout functionality
- **Dashboard Analytics**: Real-time attendance statistics and employee metrics with animated charts
- **Employee Management**: Complete CRUD operations with face image association
- **Department Organization**: Hierarchical department and role management
- **Attendance Tracking**: Time-based check-in/check-out with status classification
- **Reporting System**: Attendance reports with filtering and export capabilities
- **Settings Management**: System configuration for work hours and policies
- **Route Protection**: All admin routes protected by authentication middleware

### Development Workflow
- **Hot Reloading**: Vite development server with instant updates
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Code Organization**: Modular architecture with shared types and utilities
- **Build Process**: Optimized production builds with code splitting and asset optimization
- **Database Setup**: Easy MySQL setup with migration scripts and connection testing

## Database Configuration

### Local Development Setup
- **Database**: MySQL (XAMPP)
- **Host**: localhost
- **Port**: 3306
- **User**: root
- **Password**: (empty)
- **Database Name**: face_attendance_system

### Production Database Setup
When connecting to team's database server, update `server/database.ts`:
```typescript
const connection = await mysql.createConnection({
  host: 'your-server-host.com',
  user: 'your-username',
  password: 'your-password',
  database: 'your-database-name',
  port: 3306
});
```

### Database Tables
- **users**: Admin user accounts and authentication
- **departments**: Company departments and organization
- **roles**: Employee roles and responsibilities
- **employees**: Employee information with face recognition data
- **attendance_records**: Daily attendance tracking
- **system_settings**: Application configuration
- **sessions**: User session management
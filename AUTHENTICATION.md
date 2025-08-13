# 🔐 Hệ Thống Authentication - FaceTime

## 📋 Tổng Quan

Hệ thống authentication được xây dựng với kiến trúc **secure-by-design**, sử dụng session-based authentication với bcrypt password hashing và role-based access control.

## 🏗️ Kiến Trúc

### **Backend Authentication Layer**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Express App   │───▶│  Auth Service   │───▶│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Session Store   │    │  Validation     │    │   MySQL         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Frontend Authentication Flow**

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│   API Call  │───▶│   Session   │───▶│  Redirect   │
│   Form      │    │   to Backend│    │   Storage   │    │  to Dashboard│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 🔧 Cài Đặt và Chạy

### **1. Khởi tạo Database**

```bash
# Tạo database và tables
mysql -u root -p < database-schema.sql

# Seed dữ liệu mẫu
cd backend
node seed-data.js
```

### **2. Chạy Backend**

```bash
cd backend
npm install
npm run dev
```

### **3. Chạy Frontend**

```bash
cd client
npm install
npm run dev
```

## 📊 Tài Khoản Mẫu

| Email                 | Password        | Role        | Department | Quyền Hạn                  |
| --------------------- | --------------- | ----------- | ---------- | -------------------------- |
| admin@company.com     | Admin123!@#     | Super Admin | IT         | Toàn quyền hệ thống        |
| hr@company.com        | Hr123!@#        | HR Manager  | HR         | Quản lý nhân sự, phòng ban |
| it@company.com        | It123!@#        | Employee    | IT         | Xem thông tin cá nhân      |
| finance@company.com   | Finance123!@#   | Employee    | Finance    | Xem thông tin cá nhân      |
| marketing@company.com | Marketing123!@# | Employee    | Marketing  | Xem thông tin cá nhân      |

## 🔐 API Endpoints

### **Authentication Endpoints**

#### **POST /api/auth/login**

Đăng nhập người dùng

```json
{
  "email": "user@company.com",
  "password": "Password123!@#"
}
```

**Response Success:**

```json
{
  "message": "Đăng nhập thành công",
  "authenticated": true,
  "user": {
    "userId": 1,
    "fullName": "Admin User",
    "email": "admin@company.com",
    "role": "super_admin",
    "departmentId": 1,
    "departmentName": "IT Department",
    "phoneNumber": "0123456789",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### **POST /api/auth/register**

Đăng ký người dùng mới

```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@company.com",
  "password": "Password123!@#",
  "departmentId": 1,
  "phoneNumber": "0123456789",
  "role": "employee"
}
```

#### **POST /api/auth/logout**

Đăng xuất người dùng

#### **GET /api/auth/me**

Lấy thông tin user hiện tại

### **Public Endpoints**

#### **GET /api/departments**

Lấy danh sách phòng ban (không cần auth)

### **Protected Endpoints**

#### **GET /api/dashboard/stats**

Thống kê dashboard (cần auth)

## 🛡️ Bảo Mật

### **Password Security**

- **Hashing**: bcrypt với salt rounds = 12
- **Validation**:
  - Ít nhất 8 ký tự
  - Có chữ hoa, chữ thường, số
  - Có ký tự đặc biệt (@$!%\*?&)

### **Session Security**

- **Secret Key**: Được cấu hình trong environment
- **Cookie Settings**:
  - `httpOnly: true` - Không thể truy cập từ JavaScript
  - `secure: false` - Set true khi deploy HTTPS
  - `maxAge: 24h` - Session timeout

### **Input Validation**

- **Email**: Regex validation
- **Phone**: Vietnam phone format validation
- **SQL Injection**: Sử dụng parameterized queries

## 🔍 Validation Rules

### **Email Validation**

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
```

### **Password Validation**

```javascript
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

### **Phone Validation**

```javascript
const phoneRegex = /^(\+84|84|0)[0-9]{9}$/;
```

## 🚀 Tính Năng Nâng Cao

### **1. Password Reset**

```javascript
// Reset password (admin only)
const resetPassword = async (userId, newPassword) => {
  // Implementation
};
```

### **2. Change Password**

```javascript
// User change own password
const changePassword = async (userId, currentPassword, newPassword) => {
  // Implementation
};
```

### **3. Role-based Access Control**

```javascript
// Check user permissions
const checkPermission = (userRole, requiredRole) => {
  const roleHierarchy = {
    employee: 1,
    hr_manager: 2,
    super_admin: 3,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

## 🧪 Testing

### **Test Authentication Flow**

```bash
# 1. Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"Admin123!@#"}'

# 2. Test protected endpoint
curl -X GET http://localhost:3001/api/dashboard/stats \
  -H "Cookie: connect.sid=<session_id>"

# 3. Test logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Cookie: connect.sid=<session_id>"
```

### **Test Registration**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@company.com",
    "password": "Test123!@#",
    "departmentId": 1,
    "role": "employee"
  }'
```

## 🐛 Troubleshooting

### **Common Issues**

#### **1. Session Not Persisting**

- Kiểm tra cookie settings
- Đảm bảo `credentials: "include"` trong frontend
- Kiểm tra CORS configuration

#### **2. Password Validation Fails**

- Đảm bảo password đúng format
- Kiểm tra bcrypt configuration
- Verify salt rounds

#### **3. Database Connection Issues**

- Kiểm tra MySQL service
- Verify connection credentials
- Check database exists

### **Debug Mode**

```javascript
// Enable debug logging
console.log("🔐 Login attempt:", {
  email,
  password: password ? "***" : "undefined",
});
console.log("✅ Login successful for user:", user.fullName);
console.log("❌ Login failed:", error.message);
```

## 📈 Performance Optimization

### **1. Database Indexes**

```sql
-- Optimize user queries
ALTER TABLE Users ADD INDEX idx_email (email);
ALTER TABLE Users ADD INDEX idx_role (role);
ALTER TABLE Users ADD INDEX idx_department (department_id);

-- Optimize attendance queries
ALTER TABLE AttendanceRecords ADD INDEX idx_user_date (user_id, record_date);
```

### **2. Caching Strategy**

```javascript
// React Query caching
const { data: user } = useQuery({
  queryKey: ["/api/auth/me"],
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

## 🔮 Roadmap

### **Phase 1 (Current)**

- ✅ Basic authentication
- ✅ Role-based access control
- ✅ Session management
- ✅ Input validation

### **Phase 2 (Next)**

- 🔄 JWT tokens
- 🔄 Refresh tokens
- 🔄 Multi-factor authentication
- 🔄 OAuth integration

### **Phase 3 (Future)**

- 📋 SSO integration
- 📋 LDAP support
- 📋 Advanced audit logging
- 📋 Rate limiting

## 📞 Support

Nếu gặp vấn đề với hệ thống authentication, vui lòng:

1. Kiểm tra logs trong console
2. Verify database connection
3. Test API endpoints với Postman/curl
4. Kiểm tra browser cookies
5. Contact development team

---

**Lưu ý**: Đây là hệ thống production-ready với các biện pháp bảo mật tiêu chuẩn. Không thay đổi security settings mà không có sự đồng ý của team.

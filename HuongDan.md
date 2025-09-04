# Smart Face Attendance System - Web Admin

## Tổng quan

Hệ thống chấm công khuôn mặt thông minh với giao diện Web Admin hiện đại. Dự án sử dụng kiến trúc full-stack với React frontend và Node.js backend, tích hợp với MySQL database.

## Cấu trúc dự án

```
FaceTime/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom hooks
│   │   └── lib/             # Utilities và API config
├── employee-attendance-api/   # Backend Node.js API
│   ├── src/
│   │   ├── controllers/     # API controllers
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   └── utils/           # Database connection
├── server/                   # Legacy server (không sử dụng)
└── shared/                   # Shared schemas
```

## Yêu cầu hệ thống

- **Node.js**: v16.0.0 trở lên
- **MySQL**: v8.0 trở lên (hoặc XAMPP)
- **npm**: v8.0.0 trở lên

## Cài đặt và chạy dự án

### Bước 1: Clone dự án

```bash
git clone <repository-url>
cd "FaceTime"
```

### Bước 2: Cài đặt dependencies

```bash
# Cài đặt frontend dependencies
cd client
npm install

# Cài đặt backend dependencies
cd employee-attendance-api
npm install

# Quay về thư mục gốc
cd ..
```

### Bước 3: Cấu hình database

1. **Tạo database MySQL:**
2. **Import schema và data:**
3. **Cấu hình environment variables:**

   Tạo file `.env` trong thư mục `employee-attendance-api/`:

   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=smart_attendance
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=smart_attendance_secret_key_2024
   JWT_EXPIRES_IN=24h
   ```

### Bước 4: Chạy backend

```bash
cd employee-attendance-api
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### Bước 5: Chạy frontend

```bash
# Mở thêm terminal mới
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5000`

## Cấu trúc Database

### Bảng chính

- **Users**: Thông tin nhân viên và authentication
- **Departments**: Phòng ban
- **FacialData**: Dữ liệu khuôn mặt
- **AttendanceRecords**: Bản ghi chấm công
- **SystemConfigs**: Cấu hình hệ thống

## API Endpoints

### Authentication

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Employees

- `GET /api/employees` - Lấy danh sách nhân viên
- `POST /api/employees` - Tạo nhân viên mới
- `PUT /api/employees/:id` - Cập nhật nhân viên
- `DELETE /api/employees/:id` - Xóa nhân viên

### Departments

- `GET /api/departments` - Lấy danh sách phòng ban
- `POST /api/departments` - Tạo phòng ban mới
- `PUT /api/departments/:id` - Cập nhật phòng ban
- `DELETE /api/departments/:id` - Xóa phòng ban

### Attendance

- `GET /api/attendance` - Lấy bản ghi chấm công
- `POST /api/attendance` - Tạo bản ghi chấm công mới

## Tính năng chính

### Frontend

- **Dashboard**: Thống kê tổng quan, biểu đồ attendance
- **Employee Management**: CRUD nhân viên với địa chỉ và phone
- **Department Management**: Quản lý phòng ban và nhân viên
- **Attendance Tracking**: Theo dõi chấm công với pagination
- **Profile Page**: Trang cá nhân người dùng
- **Responsive Design**: Giao diện tương thích mobile

### Backend

- **JWT Authentication**: Xác thực và phân quyền
- **Employee ID Logic**: Tự động tính employee_id theo phòng ban
- **Address Management**: Quản lý địa chỉ nhân viên
- **Server-side Pagination**: Phân trang dữ liệu
- **Data Validation**: Kiểm tra dữ liệu đầu vào

## Cấu hình API

File `client/src/lib/api-config.js`:

```javascript
export const API_CONFIG = {
  MAIN_API: {
    BASE_URL: "http://localhost:3000/api",
    ENDPOINTS: {
      // ... các endpoint
    },
  },
};
```

## Troubleshooting

### Lỗi thường gặp

1. **Database connection failed:**

   - Kiểm tra MySQL service đang chạy
   - Kiểm tra thông tin kết nối trong `.env`

2. **Port already in use:**

   - Thay đổi PORT trong `.env`
   - Hoặc kill process đang sử dụng port

3. **CORS errors:**

   - Backend đã cấu hình CORS cho localhost:5000
   - Kiểm tra URL frontend và backend

4. **Missing dependencies:**
   ```bash
   npm install
   npm audit fix
   ```

### Kiểm tra hệ thống

1. **Test database connection:**

   ```bash
   cd employee-attendance-api
   node test-connection.js
   ```

2. **Test API endpoints:**
   ```bash
   curl http://localhost:3000/api/debug/database
   ```

## Development

### Cấu trúc code

- **Components**: Sử dụng shadcn/ui components
- **State Management**: React Query cho server state
- **Styling**: Tailwind CSS với custom components
- **Routing**: Wouter cho client-side routing

### Best Practices

- Sử dụng TypeScript cho type safety
- Implement error boundaries
- Sử dụng React Query cho data fetching
- Implement proper loading states
- Responsive design cho mobile

## Deployment

**Lưu ý**: Dự án này sử dụng backend `employee-attendance-api/` làm chính. Thư mục `server/` là legacy và không được sử dụng trong production.

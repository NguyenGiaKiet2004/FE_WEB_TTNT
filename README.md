# Hệ Thống Chấm Công Khuôn Mặt Thông Minh

## 📋 Mô tả

Hệ thống chấm công sử dụng nhận diện khuôn mặt với giao diện web admin hiện đại, được xây dựng bằng React + Node.js + MySQL.

## 🏗️ Kiến trúc hệ thống

### Frontend (React)

- **Framework**: React 18 + Vite
- **UI Library**: Tailwind CSS + shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Routing**: Wouter
- **Language**: JavaScript/TypeScript

### Backend (Node.js)

- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: Session-based với bcrypt
- **CORS**: Cross-origin resource sharing

### Database (MySQL)

- **Database**: `smart_attendance`
- **Tables**: Users, Departments, FacialData, AttendanceRecords, SystemConfigs

## 🚀 Hướng dẫn cài đặt và chạy

### 1. Yêu cầu hệ thống

- Node.js (v16 trở lên)
- MySQL (XAMPP hoặc MySQL Server)
- Git

### 2. Cài đặt Database

#### Tạo database và bảng:

```sql
-- 1. Tạo database
CREATE DATABASE IF NOT EXISTS smart_attendance
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE smart_attendance;

-- 2. Bảng Departments (Phòng ban)
CREATE TABLE Departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã phòng ban',
    department_name VARCHAR(100) NOT NULL COMMENT 'Tên phòng ban',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Bảng Users (Người dùng)
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã người dùng',
    full_name VARCHAR(100) NOT NULL COMMENT 'Họ và tên',
    email VARCHAR(100) UNIQUE NOT NULL COMMENT 'Email đăng nhập',
    password_hash VARCHAR(255) NOT NULL COMMENT 'Mật khẩu đã mã hóa',
    role ENUM('super_admin', 'hr_manager', 'employee') DEFAULT 'employee' COMMENT 'Vai trò',
    department_id INT NULL COMMENT 'Mã phòng ban',
    phone_number VARCHAR(20) DEFAULT NULL COMMENT 'Số điện thoại',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Bảng FacialData (Dữ liệu khuôn mặt)
CREATE TABLE FacialData (
    face_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã dữ liệu khuôn mặt',
    user_id INT NOT NULL COMMENT 'Mã người dùng',
    encoding_data VARCHAR(32) NOT NULL COMMENT 'Dữ liệu uuid mã hóa khuôn mặt',
    reference_image_url VARCHAR(255) NOT NULL COMMENT 'URL ảnh tham chiếu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Bảng AttendanceRecords (Bản ghi chấm công)
CREATE TABLE AttendanceRecords (
    record_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Mã bản ghi',
    user_id INT NOT NULL COMMENT 'Mã người dùng',
    check_in_time DATETIME DEFAULT NULL COMMENT 'Thời gian vào',
    check_out_time DATETIME DEFAULT NULL COMMENT 'Thời gian ra',
    status ENUM('on_time', 'late', 'absent') DEFAULT NULL COMMENT 'Trạng thái',
    record_date DATE NOT NULL COMMENT 'Ngày chấm công',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    INDEX idx_record_date (record_date),
    INDEX idx_user_date (user_id, record_date)
) ENGINE=InnoDB;

-- 6. Bảng SystemConfigs (Cấu hình hệ thống)
CREATE TABLE SystemConfigs (
    config_key VARCHAR(50) PRIMARY KEY COMMENT 'Khóa cấu hình',
    config_value VARCHAR(255) NOT NULL COMMENT 'Giá trị cấu hình',
    description VARCHAR(255) DEFAULT NULL COMMENT 'Mô tả',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

### 3. Cài đặt Backend

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Seed dữ liệu mẫu
node seed-data.js

# Chạy server (development)
npm run dev

# Hoặc chạy production
npm start
```

Backend sẽ chạy trên: `http://localhost:3001`

### 4. Cài đặt Frontend

```bash
# Di chuyển về thư mục gốc
cd ..

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy trên: `http://localhost:5000`

## 👤 Tài khoản mẫu

Sau khi chạy `seed-data.js`, bạn có thể đăng nhập với các tài khoản sau:

| Email                 | Mật khẩu    | Vai trò     |
| --------------------- | ----------- | ----------- |
| admin@company.com     | admin123    | Super Admin |
| an.nguyen@company.com | password123 | HR Manager  |
| binh.tran@company.com | password123 | Employee    |
| cuong.le@company.com  | password123 | Employee    |
| dung.pham@company.com | password123 | Employee    |

## 📁 Cấu trúc thư mục

```
FaceTime/
├── backend/                 # Backend Node.js
│   ├── server.js           # Server chính
│   ├── seed-data.js        # Script seed dữ liệu
│   └── package.json        # Dependencies backend
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Các trang chính
│   │   ├── components/    # Components UI
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
│   └── package.json       # Dependencies frontend
├── server/                 # Server cũ (TypeScript)
└── shared/                 # Shared types
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/register` - Đăng ký

### Data

- `GET /api/departments` - Lấy danh sách phòng ban
- `GET /api/dashboard/stats` - Thống kê dashboard

## 🎯 Tính năng chính

### ✅ Đã hoàn thành

- [x] Giao diện đăng nhập/đăng ký
- [x] Authentication với session
- [x] Dashboard với thống kê
- [x] Quản lý phòng ban
- [x] Quản lý người dùng
- [x] Bản ghi chấm công
- [x] Cấu hình hệ thống

### 🚧 Đang phát triển

- [ ] Upload và xử lý ảnh khuôn mặt
- [ ] Nhận diện khuôn mặt real-time
- [ ] Báo cáo chi tiết
- [ ] Thông báo email
- [ ] Phân quyền chi tiết

## 🐛 Troubleshooting

### Lỗi kết nối database

- Kiểm tra MySQL đã chạy chưa
- Kiểm tra thông tin kết nối trong `backend/server.js`
- Đảm bảo database `smart_attendance` đã được tạo

### Lỗi CORS

- Backend đã cấu hình CORS cho `http://localhost:5000`
- Nếu frontend chạy port khác, cập nhật trong `backend/server.js`

### Lỗi session

- Kiểm tra cookie settings
- Đảm bảo `credentials: "include"` trong frontend requests

## 📝 Ghi chú

- Backend hiện tại sử dụng Node.js thuần (không TypeScript)
- Database sử dụng MySQL với XAMPP
- Frontend sử dụng React với Vite
- Authentication dựa trên session với express-session

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License

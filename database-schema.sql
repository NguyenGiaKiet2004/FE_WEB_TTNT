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

-- 7. Thêm indexes cho performance
ALTER TABLE Users ADD INDEX idx_email (email);
ALTER TABLE Users ADD INDEX idx_role (role);
ALTER TABLE Users ADD INDEX idx_department (department_id);
ALTER TABLE FacialData ADD INDEX idx_user_face (user_id);

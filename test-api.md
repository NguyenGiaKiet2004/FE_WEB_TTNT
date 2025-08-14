# 🧪 **TEST API INTEGRATION**

## **BƯỚC 1: KHỞI ĐỘNG CÁC SERVER**

### **1. Employee Attendance API (Port 3000)**

```bash
cd employee-attendance-api
npm install
npm start
```

### **2. Main Backend (Port 3001)**

```bash
cd backend
npm install
npm start
```

### **3. Frontend (Port 5000)**

```bash
cd client
npm install
npm run dev
```

## **BƯỚC 2: TEST AUTHENTICATION FLOW**

### **Test 1: Register User**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "employee"
  }'
```

**Expected Response:**

```json
{
  "message": "Đăng ký người dùng thành công",
  "userId": 1
}
```

### **Test 2: Login User**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "message": "Đăng nhập thành công",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "userId": 1,
    "fullName": "Test User",
    "role": "employee"
  }
}
```

## **BƯỚC 3: TEST FRONTEND INTEGRATION**

### **1. Mở browser: http://localhost:5000**

### **2. Test Register page**

### **3. Test Login page**

### **4. Kiểm tra redirect to dashboard**

### **5. Kiểm tra user info trong header**

## **BƯỚC 4: KIỂM TRA CONSOLE ERRORS**

### **Mở DevTools Console và kiểm tra:**

- ✅ Không có lỗi CORS
- ✅ API calls thành công
- ✅ JWT token được lưu trong localStorage
- ✅ User info hiển thị trong header

## **BƯỚC 5: TROUBLESHOOTING**

### **Nếu có lỗi CORS:**

- Kiểm tra CORS middleware trong employee-api
- Đảm bảo frontend port 5000 được allow

### **Nếu có lỗi JWT:**

- Kiểm tra JWT_SECRET trong .env
- Kiểm tra token format

### **Nếu có lỗi Database:**

- Kiểm tra kết nối MySQL
- Kiểm tra database schema

## **🎯 KẾT QUẢ MONG ĐỢI:**

1. **Register** → Success message
2. **Login** → JWT token + redirect to dashboard
3. **Dashboard** → Hiển thị user info từ main API
4. **Header** → Hiển thị tên, email, role
5. **Không có lỗi** trong console

---

**Lưu ý:** Đảm bảo cả 3 server đều chạy cùng lúc!

# 🧪 **HƯỚNG DẪN TEST LUỒNG LOGIN → DASHBOARD → HIỂN THỊ THÔNG TIN USER**

## 📋 **MÔ TẢ LUỒNG HOẠT ĐỘNG:**

### **1. Login Page (`/login`)**

- User nhập email và password
- Click "Đăng Nhập"
- API call đến `/api/auth/login`
- Nếu thành công: lưu session và redirect

### **2. Redirect to Dashboard**

- Component `RedirectToDashboard` tự động chuyển hướng
- Hiển thị loading spinner với text "Chuyển hướng đến Dashboard..."
- Chuyển đến `/dashboard`

### **3. Dashboard với Header**

- Hiển thị thông tin user trong header (góc phải trên)
- Thông tin bao gồm: Tên, Email, Role (với badge màu)
- Dropdown menu với các options: Profile, Settings, Security, Logout

## 🔧 **CÁC TÍNH NĂNG ĐÃ HOÀN THIỆN:**

### ✅ **Authentication System:**

- Login/Logout với session management
- Protected routes
- Auto-redirect sau khi login
- Persistent authentication state

### ✅ **User Profile Display:**

- Hiển thị tên đầy đủ
- Hiển thị email
- Hiển thị role với badge màu sắc
- Avatar với chữ cái đầu của tên

### ✅ **Header Components:**

- Real-time clock
- Quick search
- Notifications dropdown
- User profile dropdown

### ✅ **Accessibility:**

- Proper label associations
- AutoComplete attributes
- Name attributes cho form fields
- Semantic HTML structure

## 🚀 **CÁCH TEST:**

### **1. Khởi động hệ thống:**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### **2. Test Login:**

1. Mở browser: `http://localhost:5000`
2. Sẽ tự động redirect đến `/login`
3. Nhập thông tin đăng nhập:
   - **Email:** `admin@company.com`
   - **Password:** `admin123`
4. Click "Đăng Nhập"

### **3. Kiểm tra Redirect:**

- Sẽ thấy loading spinner "Chuyển hướng đến Dashboard..."
- Tự động chuyển đến `/dashboard`

### **4. Kiểm tra Header:**

- Góc phải trên sẽ hiển thị:
  - **Tên:** "Admin User"
  - **Email:** "admin@company.com"
  - **Role:** "Super Admin" (badge vàng)
  - **Avatar:** Chữ "A" trong vòng tròn xanh

### **5. Test User Profile Dropdown:**

- Click vào avatar
- Sẽ hiển thị menu với:
  - Thông tin cá nhân
  - Cài đặt
  - Bảo mật
  - Đăng xuất

### **6. Test Logout:**

- Click "Đăng xuất" trong dropdown
- Sẽ logout và redirect về `/login`

## 🐛 **TROUBLESHOOTING:**

### **Lỗi thường gặp:**

1. **"departments.filter is not a function"**

   - ✅ Đã fix: Sửa logic extract departments từ API response

2. **Accessibility warnings**

   - ✅ Đã fix: Thêm name, autoComplete, htmlFor attributes

3. **User info không hiển thị**

   - Kiểm tra API `/api/auth/me` có trả về data đúng không
   - Kiểm tra localStorage có lưu auth data không

4. **Không redirect sau login**
   - Kiểm tra console có lỗi gì không
   - Kiểm tra React Query cache

## 📊 **API Endpoints được sử dụng:**

- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/departments` - Lấy danh sách phòng ban

## 🎯 **KẾT QUẢ MONG ĐỢI:**

Sau khi hoàn thành test, bạn sẽ thấy:

1. ✅ **Login thành công** với redirect tự động
2. ✅ **Dashboard hiển thị** với layout đầy đủ
3. ✅ **Header hiển thị thông tin user** chính xác
4. ✅ **User profile dropdown** hoạt động mượt mà
5. ✅ **Logout** hoạt động và redirect về login

## 🔄 **BƯỚC TIẾP THEO:**

Sau khi test thành công luồng này, bạn có thể:

1. **Hoàn thiện trang Employees** - CRUD operations
2. **Hoàn thiện trang Departments** - CRUD operations
3. **Tích hợp nhận diện khuôn mặt** - Upload và xử lý ảnh
4. **Hoàn thiện Attendance management** - Check-in/Check-out

---

**Lưu ý:** Đảm bảo database đã được setup và có dữ liệu mẫu trước khi test!

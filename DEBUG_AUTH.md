# 🐛 **DEBUG AUTHENTICATION FLOW**

## 📋 **Vấn đề hiện tại:**

1. **Login thành công** ✅
2. **Redirect to dashboard** ✅  
3. **Header hiển thị** ❌ - Lỗi `useAuth is not defined` và `user is not defined`

## 🔍 **Nguyên nhân:**

### **1. Header component:**
- Đã được cập nhật để sử dụng `UserProfile` component ✅
- Không còn sử dụng `useAuth` hook trực tiếp ✅

### **2. UserProfile component:**
- Sử dụng `useAuth` hook ✅
- Có debug logging để kiểm tra data ✅

### **3. useAuth hook:**
- Có `initialData` để return stored data ngay lập tức ✅
- Có logic để enable/disable query ✅

## 🧪 **Cách debug:**

### **1. Kiểm tra localStorage:**
```javascript
// Trong browser console
console.log('localStorage auth-data:', localStorage.getItem('auth-data'));
```

### **2. Kiểm tra React Query cache:**
```javascript
// Trong browser console
// Cần access queryClient instance
```

### **3. Kiểm tra API response:**
```javascript
// Test API endpoint
fetch('http://localhost:3001/api/auth/me', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

## 🔧 **Các sửa đổi đã thực hiện:**

### ✅ **useAuth hook:**
- Thêm `initialData` để return stored data ngay lập tức
- Cải thiện error handling
- Clear invalid stored data khi 401

### ✅ **useLogin hook:**
- Sửa format data lưu vào localStorage
- Đảm bảo format khớp với `useAuth` hook

### ✅ **UserProfile component:**
- Cải thiện loading, error, và not authenticated states
- Thêm debug logging
- Xử lý data extraction đúng cách

## 🎯 **Kết quả mong đợi:**

Sau khi sửa, bạn sẽ thấy:

1. **Login thành công** → Redirect to dashboard
2. **Header hiển thị thông tin user** từ localStorage ngay lập tức
3. **API call** để refresh data từ server
4. **UserProfile component** hiển thị đúng thông tin

## 🚀 **Test lại:**

1. **Clear localStorage:**
   ```javascript
   localStorage.removeItem('auth-data');
   ```

2. **Login lại:**
   - Email: `admin@company.com`
   - Password: `admin123`

3. **Kiểm tra console:**
   - Xem debug logs từ UserProfile
   - Xem localStorage có được set đúng không

4. **Kiểm tra header:**
   - Thông tin user có hiển thị không
   - Role badge có đúng màu không

---

**Lưu ý:** Nếu vẫn có lỗi, hãy kiểm tra console logs để xem chi tiết!

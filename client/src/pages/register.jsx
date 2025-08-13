import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Register() {
  const [location, setLocation] = useLocation();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    departmentId: "",
    phoneNumber: "",
    role: "employee"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch departments from API
  const { data: departments = [], isLoading: departmentsLoading, error: departmentsError } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      return await apiRequest('/api/departments');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSelectChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!form.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(form.password)) {
      newErrors.password = 'Mật khẩu phải có chữ hoa, chữ thường và số';
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    if (form.phoneNumber && !/^(\+84|84|0)[0-9]{9}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setErrors({});
    setIsPending(true);

    if (!validateForm()) {
      setIsPending(false);
      return;
    }

    try {
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          departmentId: form.departmentId ? parseInt(form.departmentId) : null,
          phoneNumber: form.phoneNumber,
          role: form.role
        }),
      });

      setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
      // Reset form
      setForm({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
        departmentId: "",
        phoneNumber: "",
        role: "employee"
      });
    } catch (error) {
      console.log('Register error:', error);
      setError(error.message || "Có lỗi xảy ra khi đăng ký");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 overflow-hidden" 
         style={{
           background: 'radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%)',
           position: 'relative'
         }}>
      {/* Stars background */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: '2px',
            height: '2px',
            background: 'white',
            borderRadius: '50%',
            opacity: 0.8,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle 2s infinite ease-in-out`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
      
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0.2; }
        }
      `}</style>

      <div className="max-w-lg w-full space-y-10">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-xl flex items-center justify-center mb-8">
            <i className="fas fa-user-plus text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">Đăng Ký Tài Khoản</h2>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow">Tạo tài khoản mới để sử dụng hệ thống</p>
        </div>
        <Card className="bg-black/70 backdrop-blur-md border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold">Thông Tin Đăng Ký</CardTitle>
            <CardDescription className="text-base text-gray-200 font-medium">Điền thông tin để tạo tài khoản mới</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-6">
                <div>
                  <Label htmlFor="fullName" className="text-lg text-white font-semibold">Họ và tên *</Label>
                  <Input 
                    id="fullName" 
                    type="text" 
                    value={form.fullName} 
                    onChange={handleChange("fullName")} 
                    required 
                    className={`mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                      errors.fullName ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-300 text-sm mt-1">{errors.fullName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email" className="text-lg text-white font-semibold">Email *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={form.email} 
                    onChange={handleChange("email")} 
                    required 
                    className={`mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                      errors.email ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password" className="text-lg text-white font-semibold">Mật khẩu *</Label>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      value={form.password} 
                      onChange={handleChange("password")} 
                      required 
                      className={`mt-2 text-lg px-5 py-4 pr-12 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                        errors.password ? 'border-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-300 text-sm mt-1">{errors.password}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-lg text-white font-semibold">Xác nhận mật khẩu *</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword" 
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword} 
                      onChange={handleChange("confirmPassword")} 
                      required 
                      className={`mt-2 text-lg px-5 py-4 pr-12 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                        errors.confirmPassword ? 'border-red-400' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-300 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="department" className="text-lg text-white font-semibold">Phòng ban</Label>
                  <Select value={form.departmentId} onValueChange={(value) => handleSelectChange("departmentId", value)}>
                    <SelectTrigger className="mt-2 text-lg px-5 py-4 text-white bg-black/40 border-gray-500 focus:bg-black/60">
                      <SelectValue placeholder={departmentsLoading ? "Đang tải..." : "Chọn phòng ban"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Đang tải danh sách phòng ban...
                        </div>
                      ) : departmentsError ? (
                        <div className="p-4 text-center text-red-500">
                          Lỗi tải danh sách phòng ban
                        </div>
                                             ) : (
                         departments
                           .filter(dept => dept && dept.department_id) // Filter out undefined/null items
                           .map(dept => (
                             <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                               {dept.department_name}
                             </SelectItem>
                           ))
                       )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-lg text-white font-semibold">Số điện thoại</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel" 
                    value={form.phoneNumber} 
                    onChange={handleChange("phoneNumber")} 
                    className={`mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                      errors.phoneNumber ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-300 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full text-lg py-3 bg-primary text-white font-bold hover:bg-primary/90" disabled={isPending}>
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng ký...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Đăng Ký
                  </>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <Button variant="link" type="button" className="text-lg text-primary font-bold" onClick={() => setLocation("/login")}>
                Đã có tài khoản? Đăng nhập
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <p className="text-base text-gray-200 font-medium">Hệ Thống Chấm Công Khuôn Mặt Thông Minh</p>
        </div>
      </div>
    </div>
  );
}

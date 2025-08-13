import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin, useAuthState } from "@/hooks/useAuth";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuthState();
  const login = useLogin();
  
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  // Monitor auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Auth state changed to authenticated, should redirect...');
    }
  }, [isAuthenticated]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!credentials.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credentials.email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!credentials.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const result = await login.mutateAsync(credentials);
      console.log('Login result:', result);
      if (result.authenticated) {
        console.log('Login successful, auth state should update...');
        // Auth state will update automatically via React Query
      }
    } catch (error) {
      console.log('Login error:', error);
    }
  };

  const handleInputChange = (field) => (e) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
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

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-xl flex items-center justify-center mb-8">
            <i className="fas fa-user-shield text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
            Đăng Nhập Hệ Thống
          </h2>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow">
            Đăng nhập để truy cập hệ thống chấm công khuôn mặt
          </p>
        </div>

        {/* Error Alert */}
        {login.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {login.error.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <Card className="bg-black/70 backdrop-blur-md border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold">Chào mừng trở lại</CardTitle>
            <CardDescription className="text-base text-gray-200 font-medium">
              Nhập thông tin đăng nhập để truy cập hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {login.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {login.error.message || "Email hoặc mật khẩu không đúng"}
                  </AlertDescription>
                </Alert>
              )}


              <div className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-lg text-white font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleInputChange("email")}
                    placeholder="Nhập email của bạn"
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
                  <Label htmlFor="password" className="text-lg text-white font-semibold">Mật khẩu</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={handleInputChange("password")}
                      placeholder="Nhập mật khẩu của bạn"
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
              </div>

              <Button 
                type="submit" 
                className="w-full text-lg py-3 bg-primary text-white font-bold hover:bg-primary/90"
                disabled={login.isPending}
              >
                {login.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Đăng Nhập
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-200 font-medium">
            Hệ Thống Chấm Công Khuôn Mặt Thông Minh
          </p>
          <p className="mt-3 text-base text-gray-100">
            Chưa có tài khoản?{' '}
            <a href="/register" className="text-primary hover:underline font-semibold">Đăng ký ngay</a>
          </p>
        </div>
      </div>
    </div>
  );
}
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
import { apiRequest } from "@/lib/api-config";

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
  const { data: departmentsResponse, isLoading: departmentsLoading, error: departmentsError } = useQuery({
    queryKey: ["/api/departments"],
    queryFn: async () => {
      return await apiRequest('/departments');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract departments array from response
  const departments = departmentsResponse?.departments || [];

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
      newErrors.fullName = 'Full name is required';
    } else if (form.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }
    
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,}$/.test(form.password)) {
      newErrors.password = 'Password must include uppercase, lowercase and a number';
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (form.phoneNumber && !/^(\+84|84|0)[0-9]{9}$/.test(form.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number';
    }
    
    if (!form.role) {
      newErrors.role = 'Please select a role';
    }
    
    // Department is optional, but if selected, validate it exists
    if (form.departmentId && !departments.find(dept => dept.department_id.toString() === form.departmentId)) {
      newErrors.departmentId = 'Invalid department';
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
          const data = await apiRequest('/auth/register', {
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

      setSuccess("Registration successful! Please sign in.");
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
      setError(error.message || "An error occurred during registration");
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
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">Create Account</h2>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow">Create a new account to use the system</p>
        </div>
        <Card className="bg-black/70 backdrop-blur-md border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold">Registration Information</CardTitle>
            <CardDescription className="text-base text-gray-200 font-medium">Fill in the information to create a new account</CardDescription>
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
                  <Label htmlFor="fullName" className="text-lg text-white font-semibold">Full name *</Label>
                  <Input 
                    id="fullName"
                    name="fullName"
                    type="text" 
                    value={form.fullName} 
                    onChange={handleChange("fullName")} 
                    required 
                    autoComplete="name"
                    placeholder="Enter your full name"
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
                    name="email"
                    type="email" 
                    value={form.email} 
                    onChange={handleChange("email")} 
                    required 
                    autoComplete="email"
                    placeholder="Nhập địa chỉ email"
                    className={`mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60 ${
                      errors.email ? 'border-red-400' : ''
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-300 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="password" className="text-lg text-white font-semibold">Password *</Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password} 
                      onChange={handleChange("password")} 
                      required 
                      autoComplete="new-password"
                      placeholder="Enter a new password"
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
                  <Label htmlFor="confirmPassword" className="text-lg text-white font-semibold">Confirm password *</Label>
                  <div className="relative">
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={form.confirmPassword} 
                      onChange={handleChange("confirmPassword")} 
                      required 
                      autoComplete="new-password"
                      placeholder="Re-enter your password to confirm"
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
                  <Label htmlFor="departmentId" className="text-lg text-white font-semibold">Department <span className="text-gray-400">(Optional)</span></Label>
                  <Select id="departmentId" value={form.departmentId} onValueChange={(value) => handleSelectChange("departmentId", value)}>
                    <SelectTrigger className="mt-2 text-lg px-5 py-4 text-white bg-black/40 border-gray-500 focus:bg-black/60">
                      <SelectValue placeholder={departmentsLoading ? "Loading..." : "Select department (optional)"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departmentsLoading ? (
                        <div className="p-4 text-center text-gray-500">
                          <Loader2 className="animate-spin mx-auto mb-2" />
                          Loading departments...
                        </div>
                      ) : departmentsError ? (
                        <div className="p-4 text-center text-red-500">
                          Failed to load departments
                        </div>
                                             ) : departments && departments.length > 0 ? (
                         departments
                           .filter(dept => dept && dept.department_id) // Filter out undefined/null items
                           .map(dept => (
                             <SelectItem key={dept.department_id} value={dept.department_id.toString()}>
                               {dept.department_name}
                             </SelectItem>
                           ))
                       ) : (
                         <>
                           <SelectItem value="">
                             <div className="flex items-center space-x-2">
                               <i className="fas fa-times text-gray-400"></i>
                               <span>No departments</span>
                             </div>
                           </SelectItem>
                           <div className="p-4 text-center text-gray-500">
                             No departments available
                           </div>
                         </>
                       )}
                    </SelectContent>
                  </Select>
                  {errors.departmentId && (
                    <p className="text-red-300 text-sm mt-1">{errors.departmentId}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="role" className="text-lg text-white font-semibold">Role *</Label>
                  <Select id="role" value={form.role} onValueChange={(value) => handleSelectChange("role", value)}>
                    <SelectTrigger className="mt-2 text-lg px-5 py-4 text-white bg-black/40 border-gray-500 focus:bg-black/60">
                      <SelectValue placeholder="Chọn vai trò" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="super_admin">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-crown text-yellow-500"></i>
                          <span>Super Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="hr_manager">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-user-tie text-blue-500"></i>
                          <span>HR Manager</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="employee">
                        <div className="flex items-center space-x-2">
                          <i className="fas fa-user text-green-500"></i>
                          <span>Employee</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role && (
                    <p className="text-red-300 text-sm mt-1">{errors.role}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-lg text-white font-semibold">Phone number</Label>
                  <Input 
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel" 
                    value={form.phoneNumber} 
                    onChange={handleChange("phoneNumber")} 
                    autoComplete="tel"
                    placeholder="Enter phone number (e.g., 0123456789)"
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
                    Registering...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Sign Up
                  </>
                )}
              </Button>
            </form>
            <div className="mt-8 text-center">
              <Button variant="link" type="button" className="text-lg text-primary font-bold" onClick={() => setLocation("/login")}>
                Already have an account? Sign in
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="text-center mt-8">
          <p className="text-base text-gray-200 font-medium">Smart Face Attendance System</p>
        </div>
      </div>
    </div>
  );
}

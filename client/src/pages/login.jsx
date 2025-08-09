import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin, useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const login = useLogin();
  
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await login.mutateAsync(credentials);
      if (result.authenticated) {
        setLocation("/dashboard");
      }
    } catch (error) {
      // Error handled by mutation
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
  <div className="min-h-screen flex items-center justify-center cosmic-bg py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
<style jsx global>{`
  .cosmic-bg {
    position: relative;
    background: radial-gradient(ellipse at bottom, #1b2735 0%, #090a0f 100%);
    min-height: 100vh;
    overflow: hidden;
  }
  .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
    opacity: 0.8;
    animation: twinkle 2s infinite ease-in-out;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.8; }
    50% { opacity: 0.2; }
  }
`}</style>
{Array.from({ length: 60 }).map((_, i) => (
  <div
    key={i}
    className="star"
    style={{
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 2}s`,
    }}
  />
))}
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-primary rounded-xl flex items-center justify-center mb-8">
            <i className="fas fa-user-shield text-white text-4xl"></i>
          </div>
          <h2 className="text-4xl font-extrabold text-white drop-shadow-md">
            Admin Login
          </h2>
          <p className="mt-4 text-lg text-gray-200 font-medium drop-shadow">
            Sign in to access the attendance system
          </p>
        </div>

        {/* Login Form */}
        <Card className="bg-black/70 backdrop-blur-md border-none shadow-2xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-base text-gray-200 font-medium">
              Enter your credentials to access the admin portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {login.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {login.error.message || "Invalid username or password"}
                  </AlertDescription>
                </Alert>
              )}


              <div className="space-y-6">
                <div>
                  <Label htmlFor="username" className="text-lg text-white font-semibold">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={handleInputChange("username")}
                    placeholder="Enter your username"
                    required
                    className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-lg text-white font-semibold">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={handleInputChange("password")}
                    placeholder="Enter your password"
                    required
                    className="mt-2 text-lg px-5 py-4 placeholder-gray-400 text-white bg-black/40 border-gray-500 focus:bg-black/60"
                  />
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
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </Button>
            </form>

          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-200 font-medium">
            Arnifi Face Recognition Attendance System
          </p>
          <p className="mt-3 text-base text-gray-100">
            Don't have an account?{' '}
            <a href="/register" className="text-primary hover:underline font-semibold">Register</a>
          </p>
        </div>
      </div>
    </div>
  );
}
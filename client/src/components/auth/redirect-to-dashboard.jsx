import { useEffect } from "react";
import { useLocation } from "wouter";

export default function RedirectToDashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('Redirecting to dashboard...');
    setLocation("/dashboard");
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-gray-600">Chuyển hướng đến Dashboard...</p>
      </div>
    </div>
  );
}

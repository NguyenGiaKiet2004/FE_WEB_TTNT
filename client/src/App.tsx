import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Employees from "@/pages/employees";
import Departments from "@/pages/departments";
import Roles from "@/pages/roles";
import Attendance from "@/pages/attendance";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/hooks/useAuth";
import NotificationToast from "@/components/notifications/notification-toast";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
  <Route path="/login" component={Login} />
  <Route path="/register" component={Register} />
      {isAuthenticated ? (
        <ProtectedRoute>
          <MainLayout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/employees" component={Employees} />
              <Route path="/departments" component={Departments} />
              <Route path="/roles" component={Roles} />
              <Route path="/attendance" component={Attendance} />
              <Route path="/reports" component={Reports} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </MainLayout>
        </ProtectedRoute>
      ) : (
        <Route component={Login} />
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <NotificationToast />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

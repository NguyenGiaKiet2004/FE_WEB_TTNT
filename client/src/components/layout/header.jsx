import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth, useLogout } from "@/hooks/useAuth";
import QuickSearch from "@/components/search/quick-search";
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location] = useLocation();
  const { user } = useAuth();
  const logout = useLogout();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getSectionName = () => {
    const path = location.replace("/", "") || "dashboard";
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-800">{getSectionName()}</h1>
          <span className="text-sm text-gray-500">
            <i className="fas fa-clock mr-1"></i>
            <span>{formatTime(currentTime)}</span>
            <span className="text-gray-400 ml-2">Real-time insights</span>
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Search */}
          <QuickSearch />
          
          {/* Notifications */}
          <NotificationsDropdown />
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{user?.fullName || user?.username || "Admin"}</div>
              <div className="text-xs text-gray-500">{user?.email || "admin@admin.com"}</div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-10 h-10 bg-primary rounded-full p-0 hover:bg-primary/90">
                  <span className="text-white font-medium">
                    {user?.fullName ? user.fullName.charAt(0) : user?.username?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex items-center space-x-2">
                  <i className="fas fa-user w-4"></i>
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center space-x-2">
                  <i className="fas fa-cog w-4"></i>
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-red-600"
                  onClick={() => logout.mutate()}
                  disabled={logout.isPending}
                >
                  <i className="fas fa-sign-out-alt w-4"></i>
                  <span>{logout.isPending ? "Signing out..." : "Sign Out"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

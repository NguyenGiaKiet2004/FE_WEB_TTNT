import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import QuickSearch from "@/components/search/quick-search";
import NotificationsDropdown from "@/components/notifications/notifications-dropdown";
import UserProfile from "./user-profile";

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location] = useLocation();

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
          <UserProfile />
        </div>
      </div>
    </header>
  );
}

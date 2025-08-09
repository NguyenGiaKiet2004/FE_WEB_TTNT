import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications data - in real app, this would come from API
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: "attendance",
        title: "John Doe checked in",
        message: "Employee John Doe has checked in at 8:30 AM",
        time: "2 minutes ago",
        read: false,
        icon: "fas fa-clock",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        id: 2,
        type: "attendance",
        title: "Sarah Wilson checked out",
        message: "Employee Sarah Wilson has checked out at 5:45 PM",
        time: "15 minutes ago",
        read: false,
        icon: "fas fa-sign-out-alt",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        id: 3,
        type: "system",
        title: "System Update Available",
        message: "New version 2.1.0 is available for download",
        time: "1 hour ago",
        read: true,
        icon: "fas fa-download",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      },
      {
        id: 4,
        type: "reminder",
        title: "Monthly Report Due",
        message: "Monthly attendance report is due tomorrow",
        time: "2 hours ago",
        read: false,
        icon: "fas fa-calendar",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      },
      {
        id: 5,
        type: "approval",
        title: "Leave Request Pending",
        message: "Mike Johnson requested 3 days leave",
        time: "3 hours ago",
        read: false,
        icon: "fas fa-user-clock",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100"
      }
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "attendance":
        return "fas fa-clock";
      case "system":
        return "fas fa-cog";
      case "reminder":
        return "fas fa-bell";
      case "approval":
        return "fas fa-user-check";
      default:
        return "fas fa-info-circle";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "attendance":
        return "text-green-600";
      case "system":
        return "text-purple-600";
      case "reminder":
        return "text-orange-600";
      case "approval":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const getNotificationBgColor = (type) => {
    switch (type) {
      case "attendance":
        return "bg-green-100";
      case "system":
        return "bg-purple-100";
      case "reminder":
        return "bg-orange-100";
      case "approval":
        return "bg-yellow-100";
      default:
        return "bg-gray-100";
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case "attendance":
        return "Attendance";
      case "system":
        return "System";
      case "reminder":
        return "Reminder";
      case "approval":
        return "Approval";
      default:
        return "Info";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative p-2">
          <i className="fas fa-bell text-lg text-gray-600"></i>
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <i className="fas fa-bell-slash text-2xl mb-2"></i>
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notification.bgColor}`}>
                      <i className={`${notification.icon} ${notification.color}`}></i>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {getNotificationBadge(notification.type)}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">{notification.time}</span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700 cursor-pointer">
          <i className="fas fa-eye mr-2"></i>
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

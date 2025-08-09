import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationToast() {
  const { toast } = useToast();
  const [lastNotification, setLastNotification] = useState(null);

  // Simulate real-time notifications
  useEffect(() => {
    const notifications = [
      {
        id: 1,
        type: "attendance",
        title: "Check-in Alert",
        message: "John Doe has checked in at 8:30 AM",
        icon: "fas fa-clock",
        color: "text-green-600",
        bgColor: "bg-green-100"
      },
      {
        id: 2,
        type: "attendance",
        title: "Check-out Alert",
        message: "Sarah Wilson has checked out at 5:45 PM",
        icon: "fas fa-sign-out-alt",
        color: "text-blue-600",
        bgColor: "bg-blue-100"
      },
      {
        id: 3,
        type: "system",
        title: "System Update",
        message: "New version 2.1.0 is available",
        icon: "fas fa-download",
        color: "text-purple-600",
        bgColor: "bg-purple-100"
      },
      {
        id: 4,
        type: "reminder",
        title: "Report Due",
        message: "Monthly attendance report is due tomorrow",
        icon: "fas fa-calendar",
        color: "text-orange-600",
        bgColor: "bg-orange-100"
      }
    ];

    // Simulate notifications every 30 seconds
    const interval = setInterval(() => {
      const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];
      setLastNotification(randomNotification);
      
      toast({
        title: (
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${randomNotification.bgColor}`}>
              <i className={`${randomNotification.icon} ${randomNotification.color} text-sm`}></i>
            </div>
            <span>{randomNotification.title}</span>
            <Badge variant="outline" className="text-xs">
              {randomNotification.type === "attendance" ? "Attendance" : 
               randomNotification.type === "system" ? "System" : 
               randomNotification.type === "reminder" ? "Reminder" : "Info"}
            </Badge>
          </div>
        ),
        description: randomNotification.message,
        duration: 5000,
        action: (
          <Button variant="outline" size="sm" className="text-xs">
            View
          </Button>
        ),
      });
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [toast]);

  return null; // This component doesn't render anything visible
}

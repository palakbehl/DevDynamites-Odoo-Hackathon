import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  DollarSign,
  User,
  FileText,
  Check,
  Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Expense Approved",
      message: "Your $42.50 expense for Starbucks has been approved",
      type: "success",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: false
    },
    {
      id: "2",
      title: "Pending Approval",
      message: "You have 3 expenses pending your approval",
      type: "info",
      timestamp: new Date(Date.now() - 86400000), // 1 day ago
      read: false,
      action: {
        label: "Review Now",
        onClick: () => console.log("Review expenses")
      }
    },
    {
      id: "3",
      title: "Policy Violation Detected",
      message: "Potential policy violation in your recent travel expense",
      type: "warning",
      timestamp: new Date(Date.now() - 172800000), // 2 days ago
      read: true
    }
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => 
      ({ ...notification, read: true })
    ));
  };

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter(notification => 
      notification.id !== id
    ));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const notificationPanel = document.getElementById("notification-panel");
      const notificationButton = document.getElementById("notification-button");
      
      if (showNotifications && notificationPanel && notificationButton) {
        if (!notificationPanel.contains(event.target as Node) && 
            !notificationButton.contains(event.target as Node)) {
          setShowNotifications(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative"
        onClick={() => setShowNotifications(!showNotifications)}
        id="notification-button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <div 
          id="notification-panel"
          className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50"
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="h-8 px-2"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark all read
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowNotifications(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <ScrollArea className="h-96">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 border-b ${getTypeColor(notification.type)} ${!notification.read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex justify-between">
                    <div className="flex items-start">
                      {getIcon(notification.type)}
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleDateString()} at {notification.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {notification.action && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              notification.action?.onClick();
                              markAsRead(notification.id);
                            }}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5"
                        onClick={() => clearNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearAll}
                className="h-8 px-2"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear all
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;
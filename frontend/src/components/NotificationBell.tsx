import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useToast } from "@/hooks/use-toast";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

interface Notification {
  notificationId: number;
  receiverId: number;
  receiverType: string;
  message: string;
  type: string;
  status: string;
  relatedBookingId?: number;
  createdAt: string;
}

// ✅ Add Booking type
interface Booking {
  bookingId: number;
  userId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: string;
  createdAt?: string;
}

interface NotificationBellProps {
  userId: number;
  userType: "USER" | "PROVIDER";
}

const NotificationBell = ({ userId, userType }: NotificationBellProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [bookingStatuses, setBookingStatuses] = useState<Record<number, string>>({});

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/notifications/${userId}`);
      if (res.ok) {
        const data: Notification[] = await res.json();
        setNotifications(data);
        setUnreadCount(
          data.filter((n: Notification) => n.status === "UNREAD").length
        );

        // Fetch booking statuses for all related bookings
        const bookingIds = data
          .filter((n: Notification) => n.relatedBookingId)
          .map((n: Notification) => n.relatedBookingId)
          .filter((id): id is number => id !== undefined) as number[]; // ensure number[]

        const uniqueBookingIds = Array.from(new Set(bookingIds)) as number[];
        
        for (const bookingId of uniqueBookingIds) {
          fetchBookingStatus(bookingId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const fetchBookingStatus = async (bookingId: number) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/bookings/provider/${userId}`);
      if (res.ok) {
        const bookings: Booking[] = await res.json(); // ✅ Type the response
        const booking = bookings.find((b) => b.bookingId === bookingId);
        if (booking) {
          setBookingStatuses((prev) => ({
            ...prev,
            [bookingId]: booking.status,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch booking status:", error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`${BACKEND_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/notifications/${userId}/read-all`, {
        method: "PATCH",
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleAccept = async (bookingId: number, notificationId: number) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "ACCEPTED" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Booking Accepted",
          description: "You have successfully accepted the booking request.",
        });
        
        // Update local status immediately
        setBookingStatuses((prev) => ({
          ...prev,
          [bookingId]: "ACCEPTED",
        }));
        
        await markAsRead(notificationId);
        fetchNotifications();
      } else {
        throw new Error("Failed to accept booking");
      }
    } catch (error) {
      console.error("Failed to accept booking:", error);
      toast({
        title: "Error",
        description: "Failed to accept booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (bookingId: number, notificationId: number) => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "REJECTED" }),
        }
      );

      if (response.ok) {
        toast({
          title: "Booking Rejected",
          description: "You have rejected the booking request.",
        });
        
        // Update local status immediately
        setBookingStatuses((prev) => ({
          ...prev,
          [bookingId]: "REJECTED",
        }));
        
        await markAsRead(notificationId);
        fetchNotifications();
      } else {
        throw new Error("Failed to reject booking");
      }
    } catch (error) {
      console.error("Failed to reject booking:", error);
      toast({
        title: "Error",
        description: "Failed to reject booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-600">✓ Accepted</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">✗ Rejected</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-600">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return null;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => {
              const bookingStatus = notification.relatedBookingId
                ? bookingStatuses[notification.relatedBookingId]
                : null;
              const isPending = bookingStatus === "PENDING" || !bookingStatus;

              return (
                <DropdownMenuItem
                  key={notification.notificationId}
                  className={`flex flex-col items-start p-3 cursor-pointer ${
                    notification.status === "UNREAD" ? "bg-blue-50" : ""
                  }`}
                  onClick={() => markAsRead(notification.notificationId)}
                >
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>

                  {/* Show Accept/Reject buttons ONLY if booking is PENDING */}
                  {userType === "PROVIDER" &&
                    notification.type === "BOOKING_REQUEST" &&
                    notification.relatedBookingId &&
                    isPending && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAccept(
                              notification.relatedBookingId!,
                              notification.notificationId
                            );
                          }}
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(
                              notification.relatedBookingId!,
                              notification.notificationId
                            );
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}

                  {/* Show status badge if booking is NOT pending */}
                  {userType === "PROVIDER" &&
                    notification.type === "BOOKING_REQUEST" &&
                    notification.relatedBookingId &&
                    !isPending && (
                      <div className="mt-2">
                        {getStatusBadge(bookingStatus!)}
                      </div>
                    )}
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

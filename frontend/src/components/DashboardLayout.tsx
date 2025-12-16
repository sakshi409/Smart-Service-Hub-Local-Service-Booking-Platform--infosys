import { ReactNode, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import NotificationBell from "./NotificationBell";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  menuItems: Array<{ label: string; icon: ReactNode; path: string }>;
  currentPath: string;
  userType?: "USER" | "PROVIDER" | "ADMIN";
}

const DashboardLayout = ({ 
  children, 
  title, 
  menuItems, 
  currentPath, 
  userType = "USER"
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    console.log("🔍 Raw userData from localStorage:", userData);
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log("✅ Parsed user data:", user);
        
        const extractedUserId = user.userId || user.providerId || user.id;
        console.log("🆔 Extracted User ID:", extractedUserId);
        console.log("👤 User Type:", userType);
        
        setUserId(extractedUserId);
        
        console.log("🔔 Should show notification bell?", extractedUserId && userType !== "ADMIN");
      } catch (error) {
        console.error("❌ Failed to parse user data:", error);
      }
    } else {
      console.warn("⚠️ No userData found in localStorage");
    }
  }, [userType]);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (response.ok) {
        toast({
          title: "Booking Accepted ✅",
          description: "You have successfully accepted the booking request.",
        });
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

  const handleRejectBooking = async (bookingId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED" }),
      });

      if (response.ok) {
        toast({
          title: "Booking Rejected ❌",
          description: "You have rejected the booking request.",
        });
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

  // Log outside of JSX
  console.log("🎯 Rendering header. UserId:", userId, "UserType:", userType);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Wrench className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">Smart Service Hub</span>
            </div>
            
            {/* Right side: Notification Bell + Logout */}
            <div className="flex items-center gap-3">
              {/* Notification Bell - Only show for USER and PROVIDER */}
              {userId && userType !== "ADMIN" && (
                <NotificationBell
                  userId={userId}
                  userType={userType}
                  onAcceptBooking={userType === "PROVIDER" ? handleAcceptBooking : undefined}
                  onRejectBooking={userType === "PROVIDER" ? handleRejectBooking : undefined}
                />
              )}
              
              {/* Logout Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-[250px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-2">
            <h2 className="text-lg font-semibold px-4 mb-4">{title}</h2>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = currentPath === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Wrench, Calendar as CalendarIcon, Star, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

type Booking = {
  bookingId: number;
  userId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: BookingStatus;
};

type Session = { id: number; role: "SERVICE_PROVIDER" | "USER" | "ADMIN" };

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

export default function BookingRequests() {
  const location = useLocation();
  const { toast } = useToast();

  const session: Session | null = useMemo(() => {
    try { 
      const raw = localStorage.getItem("userData"); 
      return raw ? JSON.parse(raw) : null; 
    } catch { 
      return null; 
    }
  }, []);
  
  const providerId = session?.id;

  const menuItems = [
    { label: "Profile", icon: <User className="h-5 w-5" />, path: "/provider-dashboard" },
    { label: "My Services", icon: <Wrench className="h-5 w-5" />, path: "/provider-dashboard/services" },
    { label: "Booking Requests", icon: <CalendarIcon className="h-5 w-5" />, path: "/provider-dashboard/bookings" },
    { label: "Reviews", icon: <Star className="h-5 w-5" />, path: "/provider-dashboard/reviews" },
  ];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: BookingStatus) => {
    const variants: Record<BookingStatus, "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      ACCEPTED: "default",
      REJECTED: "destructive",
      COMPLETED: "outline",
      CANCELLED: "destructive",
    };
    const label = status.charAt(0) + status.slice(1).toLowerCase();
    return <Badge variant={variants[status]}>{label}</Badge>;
  };

  const load = async () => {
    try {
      if (!providerId) return;
      setLoading(true);
      const res = await fetch(`${BACKEND_BASE}/api/bookings/provider/${providerId}`, { 
        headers: { Accept: "application/json" }, 
        mode: "cors" 
      });
      if (!res.ok) throw new Error(`Failed to load (status ${res.status})`);
      setBookings(await res.json());
    } catch (e: any) {
      toast({ 
        title: "Error", 
        description: e?.message || "Failed to load bookings", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (bookingId: number, status: BookingStatus) => {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",  // Keep as PUT since backend supports both now
        headers: { 
          "Content-Type": "application/json", 
          Accept: "application/json" 
        },
        mode: "cors",
        body: JSON.stringify({ status }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update (status ${res.status}): ${errorText}`);
      }
      
      const updated = await res.json();
      setBookings((prev) => prev.map((b) => (b.bookingId === bookingId ? updated : b)));
      
      toast({ 
        title: "Success ✅", 
        description: `Booking ${status.toLowerCase()}` 
      });
    } catch (e: any) {
      console.error("Failed to update booking:", e);
      toast({ 
        title: "Error", 
        description: e?.message || "Failed to update booking", 
        variant: "destructive" 
      });
    }
  };

  useEffect(() => { 
    load(); 
    // eslint-disable-next-line
  }, [providerId]);

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      menuItems={menuItems} 
      currentPath={location.pathname}
      userType="PROVIDER"
    >
      <Card>
        <CardHeader>
          <CardTitle>Booking Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading…</div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No booking requests yet.
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div 
                  key={b.bookingId} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{b.serviceType}</h3>
                      {getStatusBadge(b.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {b.bookingDate} at {b.bookingTime?.slice(0, 5)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      User ID: {b.userId} • Booking ID: {b.bookingId}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {b.status === "PENDING" && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => setStatus(b.bookingId, "ACCEPTED")}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => setStatus(b.bookingId, "REJECTED")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    {b.status === "ACCEPTED" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => setStatus(b.bookingId, "COMPLETED")}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

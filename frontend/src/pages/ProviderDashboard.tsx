import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Wrench, Calendar as CalendarIcon, Star, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";

type Booking = {
  bookingId: number;
  userId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;  // yyyy-MM-dd
  bookingTime: string;  // HH:mm:ss
  status: BookingStatus;
};

type ProviderSession = {
  id: number;                         // providerId returned by backend auth
  role: "SERVICE_PROVIDER" | "USER" | "ADMIN";
  fullName?: string;
};

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

const ProviderDashboard = () => {
  const location = useLocation();
  const { toast } = useToast();

  const session: ProviderSession | null = useMemo(() => {
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

  const fetchBookings = async () => {
    try {
      if (!providerId || session?.role !== "SERVICE_PROVIDER") {
        toast({ title: "Not logged in", description: "Please log in as a Service Provider.", variant: "destructive" });
        return;
      }
      setLoading(true);
      const res = await fetch(`${BACKEND_BASE}/api/bookings/provider/${providerId}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load bookings (status ${res.status})`);
      }
      const data = (await res.json()) as Booking[];
      setBookings(data || []);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (bookingId: number, status: BookingStatus) => {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        mode: "cors",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to update status (status ${res.status})`);
      }
      const updated = (await res.json()) as Booking;
      setBookings((prev) => prev.map((b) => (b.bookingId === bookingId ? updated : b)));

      const msg = status === "ACCEPTED" ? "accepted" : status === "REJECTED" ? "rejected" : "updated";
      toast({ title: "Success", description: `Booking ${msg}` });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not update booking", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const totalBookings = bookings.length;
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const averageRating = 4.8; // hook up to aggregates later if desired

  return (
    <DashboardLayout
      title="Provider Dashboard"
      menuItems={menuItems}
      currentPath={location.pathname}
    >
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {session?.fullName || "Provider"}!
          </h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{totalBookings}</p>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{completedCount}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{averageRating}</p>
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading bookings…</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No booking requests yet.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div
                    key={b.bookingId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{b.serviceType}</h3>
                        {getStatusBadge(b.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {b.bookingDate} at {b.bookingTime?.slice(0, 5)}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {b.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(b.bookingId, "ACCEPTED")} className="flex-1 sm:flex-none">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(b.bookingId, "REJECTED")} className="flex-1 sm:flex-none">
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                      {b.status === "ACCEPTED" && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(b.bookingId, "COMPLETED")}>
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
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;

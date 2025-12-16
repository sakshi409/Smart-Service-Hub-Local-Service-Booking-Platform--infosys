import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { User, Wrench, Calendar as CalendarIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Provider = {
  providerId: number;
  fullName: string;
  email?: string;
  mobile?: string;
  serviceType?: string;
  experience?: number;
  price?: number | string;
  availability?: string;
  location?: string;
};

type Booking = {
  bookingId: number;
  providerId: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
};

type Session = { id: number; role: "SERVICE_PROVIDER" | "USER" | "ADMIN"; fullName?: string };

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

export default function ProfileDashboard() {
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

  const [provider, setProvider] = useState<Provider | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      if (!providerId || session?.role !== "SERVICE_PROVIDER") return;
      setLoading(true);

      const [pRes, bRes] = await Promise.all([
        fetch(`${BACKEND_BASE}/api/provider/profile/${providerId}`, { 
          headers: { Accept: "application/json" }, 
          mode: "cors" 
        }),
        fetch(`${BACKEND_BASE}/api/bookings/provider/${providerId}`, { 
          headers: { Accept: "application/json" }, 
          mode: "cors" 
        }),
      ]);

      if (pRes.ok) setProvider(await pRes.json());
      if (bRes.ok) setBookings(await bRes.json());
    } catch (e: any) {
      toast({ 
        title: "Error", 
        description: e?.message || "Failed to load dashboard", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // eslint-disable-next-line
  }, [providerId]);

  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const avgRating = 4.8; // hook provider reviews aggregation later

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      menuItems={menuItems} 
      currentPath={location.pathname}
      userType="PROVIDER"
    >
      <div className="space-y-6">
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome, {session?.fullName || provider?.fullName || "Provider"}!
          </h1>
          <p className="text-muted-foreground">Manage your services and bookings</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-primary">{loading ? "-" : total}</p>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-accent">{loading ? "-" : completed}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-foreground">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Provider profile quick info */}
        <Card>
          <CardContent className="pt-6">
            {provider ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{provider.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Service</p>
                  <p className="font-medium">{provider.serviceType || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-medium">{provider.experience ?? 0} years</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{provider.location || "-"}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {loading ? "Loading profile..." : "Profile not found."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

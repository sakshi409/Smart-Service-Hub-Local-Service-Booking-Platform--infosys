import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "react-router-dom";
import { User, Wrench, Calendar as CalendarIcon, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Review = {
  reviewId: number;
  bookingId: number;
  userId: number;
  providerId: number;
  rating: number;
  comment?: string;
  createdAt?: string;
};

type Session = { id: number; role: "SERVICE_PROVIDER" | "USER" | "ADMIN" };

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

export default function ProviderReviews() {
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

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      if (!providerId) return;
      setLoading(true);
      const res = await fetch(`${BACKEND_BASE}/api/provider/reviews/${providerId}`, { 
        headers: { Accept: "application/json" }, 
        mode: "cors" 
      });
      if (!res.ok) throw new Error(`Failed to load (status ${res.status})`);
      setReviews(await res.json());
    } catch (e: any) {
      toast({ 
        title: "Error", 
        description: e?.message || "Failed to load reviews", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
    // eslint-disable-next-line
  }, [providerId]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <DashboardLayout 
      title="Provider Dashboard" 
      menuItems={menuItems} 
      currentPath={location.pathname}
      userType="PROVIDER"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Reviews</CardTitle>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold">{avgRating}</span>
              <span className="text-sm text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading…</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No reviews yet. Complete some bookings to receive reviews!
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.reviewId} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${
                            i < r.rating 
                              ? "fill-yellow-400 text-yellow-400" 
                              : "text-gray-300"
                          }`} 
                        />
                      ))}
                      <span className="ml-2 text-sm font-semibold">{r.rating}/5</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : ""}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground mt-2 leading-relaxed">
                      "{r.comment}"
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    User ID: {r.userId} • Booking ID: {r.bookingId}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

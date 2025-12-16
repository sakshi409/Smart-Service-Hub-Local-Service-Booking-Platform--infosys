import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User as UserIcon,
  DollarSign,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Booking = {
  bookingId: number;
  userId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;
  bookingTime: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "PAID" | "CANCELLED";
  createdAt?: string;
};

type LoginSession = {
  id: number;
  role: "USER" | "SERVICE_PROVIDER" | "ADMIN";
  fullName?: string;
  email?: string;
  mobile?: string;
};

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

const MyBookings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const session: LoginSession | null = useMemo(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      if (!session?.id || session.role !== "USER") {
        toast({
          title: "Not logged in",
          description: "Please log in as a User to view bookings.",
          variant: "destructive",
        });
        return;
      }

      setLoading(true);
      const res = await fetch(`${BACKEND_BASE}/api/bookings/user/${session.id}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to load bookings with status ${res.status}`);
      }

      const data = (await res.json()) as Booking[];
      setBookings(data);
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to fetch bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (booking: Booking) => {
    const paymentData = {
      bookingId: booking.bookingId,
      providerId: booking.providerId,
      service: booking.serviceType,
      rate: "₹500",
      date: booking.bookingDate,
      time: booking.bookingTime,
    };

    localStorage.setItem('pendingPayment', JSON.stringify(paymentData));
    navigate('/payment');
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatusBadge = (status: Booking["status"]) => {
    const variants: Record<Booking["status"], "default" | "secondary" | "destructive" | "outline"> = {
      PENDING: "secondary",
      ACCEPTED: "default",
      REJECTED: "destructive",
      COMPLETED: "outline",
      PAID: "default",
      CANCELLED: "destructive",
    };
    const label = status === "PAID" ? "Payment Completed" : status.charAt(0) + status.slice(1).toLowerCase();
    return <Badge variant={variants[status]}>{label}</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Track and manage your service bookings</p>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bookings yet. Book a service to get started!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.bookingId} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{b.serviceType}</CardTitle>
                  {getStatusBadge(b.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Provider ID:</span>
                      <span className="font-medium">{b.providerId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">See provider card</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {new Date(b.bookingDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">{b.bookingTime?.slice(0, 5)} {parseInt(b.bookingTime?.slice(0, 2)) >= 12 ? 'PM' : 'AM'}</span>
                    </div>
                  </div>
                </div>

                {/* Show Pay Now button only for COMPLETED status */}
                {b.status === "COMPLETED" && (
                  <div className="mt-4 pt-4 border-t">
                    <Button
                      onClick={() => handlePayNow(b)}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  </div>
                )}

                {/* Show Payment Completed message for PAID status */}
                {b.status === "PAID" && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-center gap-2 text-green-600 font-medium p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                      <span>Payment Completed</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Booking = {
  bookingId: number;
  userId: number;
  providerId: number;
  serviceType: string;
  bookingDate: string;   // yyyy-MM-dd
  bookingTime: string;   // HH:mm:ss
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "COMPLETED" | "CANCELLED";
};

type Review = {
  reviewId?: number;
  bookingId: number;
  userId: number;
  providerId: number;
  rating: number;
  comment?: string;
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

const Reviews = () => {
  const { toast } = useToast();

  const session: LoginSession | null = useMemo(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [completedBookings, setCompletedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  // Compose new review
  const [openReview, setOpenReview] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");

  // For showing a small list of reviews of the selected provider (optional)
  const [providerReviews, setProviderReviews] = useState<Review[]>([]);
  const [loadingProviderReviews, setLoadingProviderReviews] = useState(false);

  const fetchCompletedBookings = async () => {
    try {
      if (!session?.id || session.role !== "USER") {
        toast({
          title: "Not logged in",
          description: "Please log in as a User to view reviews.",
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
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Failed to load bookings (status ${res.status})`);
      }
      const data = (await res.json()) as Booking[];
      setCompletedBookings((data || []).filter((b) => b.status === "COMPLETED"));
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not load bookings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Optional: load provider's existing reviews to display context
  const fetchProviderReviews = async (providerId: number) => {
    try {
      setLoadingProviderReviews(true);
      const res = await fetch(`${BACKEND_BASE}/api/provider/reviews/${providerId}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        mode: "cors",
      });
      if (!res.ok) {
        setProviderReviews([]);
        return;
      }
      const data = (await res.json()) as Review[];
      setProviderReviews(data || []);
    } catch {
      setProviderReviews([]);
    } finally {
      setLoadingProviderReviews(false);
    }
  };

  const openReviewDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setRating(0);
    setComment("");
    setOpenReview(true);
    fetchProviderReviews(booking.providerId);
  };

  const handleSubmitReview = async () => {
    try {
      if (!session?.id || session.role !== "USER") {
        toast({ title: "Not logged in", description: "Please log in as a User to submit a review.", variant: "destructive" });
        return;
      }
      if (!selectedBooking) {
        toast({ title: "Error", description: "No booking selected", variant: "destructive" });
        return;
      }
      if (rating < 1) {
        toast({ title: "Error", description: "Please select a rating", variant: "destructive" });
        return;
      }

      const payload: Review = {
        bookingId: selectedBooking.bookingId,
        userId: session.id,
        providerId: selectedBooking.providerId,
        rating,
        comment: comment?.trim() || undefined,
      };

      const res = await fetch(`${BACKEND_BASE}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        mode: "cors",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to submit review (status ${res.status})`);
      }

      await res.json();
      toast({ title: "Success!", description: "Review submitted successfully" });
      setOpenReview(false);

      // Refresh provider reviews to include the newly created one
      fetchProviderReviews(selectedBooking.providerId);
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Could not submit review", variant: "destructive" });
    }
  };

  const renderStars = (current: number, interactive = false) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-5 w-5 ${n <= current ? "fill-accent text-accent" : "text-muted-foreground"} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
          onClick={interactive ? () => setRating(n) : undefined}
        />
      ))}
    </div>
  );

  useEffect(() => {
    fetchCompletedBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reviews</h1>
          <p className="text-muted-foreground">Rate and review your completed services</p>
        </div>

        {completedBookings.length > 0 && (
          <Dialog open={openReview} onOpenChange={setOpenReview}>
            <DialogTrigger asChild>
              <Button
                onClick={() => openReviewDialog(completedBookings[0])}
                className="flex"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Write Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Write a Review</DialogTitle>
                <DialogDescription>Share your experience with the service provider</DialogDescription>
              </DialogHeader>

              {/* Booking chooser */}
              <div className="space-y-2">
                <Label>Select Booking</Label>
                <div className="space-y-2 max-h-48 overflow-auto pr-1">
                  {completedBookings.map((b) => (
                    <div
                      key={b.bookingId}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedBooking?.bookingId === b.bookingId ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => {
                        setSelectedBooking(b);
                        fetchProviderReviews(b.providerId);
                      }}
                    >
                      <p className="font-medium">{b.serviceType}</p>
                      <p className="text-sm text-muted-foreground">
                        Booking #{b.bookingId} • {b.bookingDate} {b.bookingTime?.slice(0,5)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating</Label>
                {renderStars(rating, true)}
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <Label>Comment (Optional)</Label>
                <Textarea
                  placeholder="Share your experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <Button className="w-full" onClick={handleSubmitReview}>
                Submit Review
              </Button>

              {/* Optional: show existing reviews for the provider */}
              {selectedBooking && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Recent reviews for provider #{selectedBooking.providerId}
                  </p>
                  {loadingProviderReviews ? (
                    <p className="text-sm text-muted-foreground">Loading reviews…</p>
                  ) : providerReviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No reviews yet.</p>
                  ) : (
                    <div className="space-y-3 max-h-52 overflow-auto pr-1">
                      {providerReviews.map((r) => (
                        <div key={r.reviewId ?? `${r.userId}-${r.bookingId}`} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between">
                            {renderStars(r.rating)}
                            <span className="text-xs text-muted-foreground">
                              <CalendarIcon className="h-3 w-3 inline mr-1" />
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          {r.comment && <p className="text-sm mt-2">{r.comment}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">Loading completed bookings…</CardContent>
        </Card>
      ) : completedBookings.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            <p className="text-sm text-muted-foreground mt-2">Complete a booking to leave a review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eligible Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {completedBookings.map((b) => (
                <div key={b.bookingId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{b.serviceType}</p>
                    <p className="text-sm text-muted-foreground">
                      #{b.bookingId} • {b.bookingDate} {b.bookingTime?.slice(0, 5)}
                    </p>
                  </div>
                  <Button onClick={() => openReviewDialog(b)}>Review</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Reviews;

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

type LoginSession = {
  id: number;
  role: "USER" | "SERVICE_PROVIDER" | "ADMIN";
  fullName?: string;
};

export default function BookingPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState({
    service: "",
    rate: "",
    location: "",
    providerName: "",
    providerId: 0,
    date: "",
    time: "",
  });

  const session: LoginSession | null = useMemo(() => {
    try {
      const raw = localStorage.getItem("userData");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const savedBooking = localStorage.getItem('pendingBooking');
    if (savedBooking) {
      try {
        const data = JSON.parse(savedBooking);
        setBookingData({
          service: data.service || "Service",
          rate: data.rate || "₹0",
          location: data.location || "Not specified",
          providerName: data.providerName || "Provider",
          providerId: data.providerId || 0,
          date: data.date || "",
          time: data.time || "",
        });
      } catch (error) {
        console.error("Failed to parse booking data:", error);
      }
    } else {
      navigate('/user-dashboard/search');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.date || !bookingData.time) {
      toast({
        title: "Error",
        description: "Please select both date and time",
        variant: "destructive",
      });
      return;
    }

    if (!session?.id || session.role !== "USER") {
      toast({
        title: "Not logged in",
        description: "Please log in as a User to book a service.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Format time to HH:mm:ss
      const time = /^\d{2}:\d{2}$/.test(bookingData.time) 
        ? `${bookingData.time}:00` 
        : bookingData.time;

      const payload = {
        userId: session.id,
        providerId: bookingData.providerId,
        serviceType: bookingData.service || "Service",
        bookingDate: bookingData.date,
        bookingTime: time,
      };

      console.log("Creating booking:", payload);

      const res = await fetch(`${BACKEND_BASE}/api/bookings`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          Accept: "application/json" 
        },
        mode: "cors",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || `Booking failed with status ${res.status}`);
      }

      const booking = await res.json();
      
      console.log("Booking created successfully:", booking);

      // Clear booking data
      localStorage.removeItem('pendingBooking');

      toast({
        title: "Booking Successful!",
        description: `Your booking request has been sent to the provider. Booking ID: ${booking.bookingId}`,
      });

      // Navigate to My Bookings
      navigate('/user-dashboard/bookings');
      
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Error",
        description: error.message || 'Booking failed. Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <Card className="w-full max-w-md relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={() => navigate(-1)}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Book {bookingData.service} Service</CardTitle>
          <p className="text-sm text-muted-foreground">
            Schedule an appointment with {bookingData.providerName}
          </p>
        </CardHeader>

        <CardContent className="pb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-normal">Service:</Label>
                <span className="font-medium">{bookingData.service}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-normal">Rate:</Label>
                <span className="font-medium">{bookingData.rate}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-normal">Location:</Label>
                <span className="font-medium">{bookingData.location}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-semibold">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                className="w-full"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time" className="font-semibold">Select Time</Label>
              <Select
                value={bookingData.time}
                onValueChange={(value) => setBookingData({ ...bookingData, time: value })}
              >
                <SelectTrigger id="time" className="w-full">
                  <SelectValue placeholder="Choose time slot" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="09:00">09:00 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="14:00">02:00 PM</SelectItem>
                  <SelectItem value="15:00">03:00 PM</SelectItem>
                  <SelectItem value="16:00">04:00 PM</SelectItem>
                  <SelectItem value="17:00">05:00 PM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

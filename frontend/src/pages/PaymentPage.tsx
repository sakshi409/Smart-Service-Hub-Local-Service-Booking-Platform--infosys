import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

export default function PaymentPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [saveInfo, setSaveInfo] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

  useEffect(() => {
    const payment = localStorage.getItem('pendingPayment');
    if (payment) {
      setPaymentInfo(JSON.parse(payment));
    } else {
      toast({
        title: "Error",
        description: "No payment information found",
        variant: "destructive",
      });
      navigate('/user-dashboard/bookings');
    }
  }, [navigate, toast]);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const markBookingAsPaid = async (bookingId: number) => {
    try {
      const res = await fetch(`${BACKEND_BASE}/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Accept: "application/json" 
        },
        mode: "cors",
        body: JSON.stringify({ status: "PAID" }),
      });

      if (!res.ok) {
        throw new Error("Failed to update booking status");
      }

      return await res.json();
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email || !cardNumber || !expiry || !cvc || !name) {
      toast({
        title: "Error",
        description: "Please fill in all payment fields",
        variant: "destructive",
      });
      return;
    }

    const cleanedCard = cardNumber.replace(/\s/g, '');
    
    if (cleanedCard.length !== 16) {
      toast({
        title: "Error",
        description: "Card number must be 16 digits",
        variant: "destructive",
      });
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast({
        title: "Error",
        description: "Expiry must be in MM/YY format",
        variant: "destructive",
      });
      return;
    }

    if (cvc.length !== 3) {
      toast({
        title: "Error",
        description: "CVC must be 3 digits",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const isTestCard = cleanedCard === '4242424242424242';
      
      if (!isTestCard && cleanedCard.length !== 16) {
        throw new Error('Payment failed. Please use test card: 4242 4242 4242 4242');
      }

      // ✅ Mark booking as PAID in database
      await markBookingAsPaid(paymentInfo.bookingId);

      // Clear payment data
      localStorage.removeItem('pendingPayment');

      toast({
        title: "Payment Successful!",
        description: `Payment completed for Booking ID: ${paymentInfo.bookingId}`,
      });

      navigate('/payment-success');
      
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error",
        description: error.message || 'Payment failed. Please try again.',
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const amount = paymentInfo?.rate ? 
    parseFloat(paymentInfo.rate.replace('₹', '')) : 500;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <div className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mb-2">
              TEST MODE
            </div>
            <h2 className="text-2xl font-bold mb-2">Service Payment</h2>
            <p className="text-sm text-gray-600 mb-2">Booking #{paymentInfo?.bookingId}</p>
            <p className="text-3xl font-bold">₹{amount.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-2">OR</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Payment method</Label>
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Card information</Label>
                
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    className="pr-10"
                    required
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    maxLength={5}
                    required
                  />
                  <Input
                    type="text"
                    placeholder="CVC"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Cardholder name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Full name on card"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country or region</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="India">India</SelectItem>
                    <SelectItem value="USA">United States</SelectItem>
                    <SelectItem value="UK">United Kingdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="save-info"
                checked={saveInfo}
                onCheckedChange={(checked) => setSaveInfo(checked as boolean)}
              />
              <label
                htmlFor="save-info"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Save my information for faster checkout
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg"
              disabled={loading}
            >
              {loading ? 'Processing Payment...' : 'Pay'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm font-semibold text-blue-800 mb-2">Test Card Numbers:</p>
            <p className="text-xs text-blue-700">4242 4242 4242 4242 (Success)</p>
            <p className="text-xs text-blue-700 mt-1">Use any future date for expiry & any 3 digits for CVC</p>
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            Powered by stripe | Terms | Privacy
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

type Session = { 
  id: number; 
  role: "SERVICE_PROVIDER" | "USER" | "ADMIN"; 
  fullName?: string 
};

const BACKEND_BASE = import.meta.env.VITE_API_BASE?.toString() || "http://localhost:8080";

export default function MyServices() {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    serviceType: "",
    experience: "",
    price: "",
    availability: "",
    location: "",
  });

  const fetchProvider = async () => {
    try {
      if (!providerId || session?.role !== "SERVICE_PROVIDER") return;
      setLoading(true);

      const res = await fetch(`${BACKEND_BASE}/api/provider/profile/${providerId}`, {
        headers: { Accept: "application/json" },
        mode: "cors",
      });

      if (res.ok) {
        const data = await res.json();
        setProvider(data);
        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          mobile: data.mobile || "",
          serviceType: data.serviceType || "",
          experience: data.experience?.toString() || "",
          price: data.price?.toString() || "",
          availability: data.availability || "",
          location: data.location || "",
        });
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!providerId) return;
      setSaving(true);

      const res = await fetch(`${BACKEND_BASE}/api/provider/profile/${providerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          ...formData,
          experience: parseInt(formData.experience) || 0,
          price: parseFloat(formData.price) || 0,
        }),
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Service details updated successfully",
        });
        fetchProvider();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProvider();
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
          <CardTitle>My Services</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceType">Service Type</Label>
                <Input
                  id="serviceType"
                  value={formData.serviceType}
                  onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="col-span-1 md:col-span-2">
                <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

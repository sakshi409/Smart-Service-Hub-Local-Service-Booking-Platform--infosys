import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Users, Wrench, Calendar, AlertCircle } from "lucide-react";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const ManageProviders = () => {
  const location = useLocation();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <TrendingUp className="h-5 w-5" />, path: "/admin-dashboard" },
    { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin-dashboard/users" },
    { label: "Manage Providers", icon: <Wrench className="h-5 w-5" />, path: "/admin-dashboard/providers" },
    { label: "Booking Overview", icon: <Calendar className="h-5 w-5" />, path: "/admin-dashboard/bookings" },
    { label: "Complaints", icon: <AlertCircle className="h-5 w-5" />, path: "/admin-dashboard/complaints" },
  ];

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        console.log("Fetching providers from:", `${BACKEND_URL}/api/admin/providers`);
        const res = await fetch(`${BACKEND_URL}/api/admin/providers`);
        
        console.log("Providers response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Providers API error:", errorText);
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Providers fetched:", data.length);
        setProviders(data);
      } catch (error) {
        console.error("❌ Failed to load providers:", error);
      }
      setLoading(false);
    };
    fetchProviders();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems} currentPath={location.pathname}>
      <h2 className="text-2xl font-bold mb-4">Manage Providers</h2>
      {loading ? (
        <p>Loading providers...</p>
      ) : providers.length === 0 ? (
        <p className="text-muted-foreground">No providers found in the database.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Provider ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {providers.map((provider) => (
              <TableRow key={provider.providerId}>
                <TableCell>{provider.providerId}</TableCell>
                <TableCell>{provider.fullName}</TableCell>
                <TableCell>{provider.email}</TableCell>
                <TableCell>{provider.serviceType}</TableCell>
                <TableCell>{provider.location}</TableCell>
                <TableCell>{provider.experience || "-"}</TableCell>
                <TableCell>₹{provider.price || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ManageProviders;

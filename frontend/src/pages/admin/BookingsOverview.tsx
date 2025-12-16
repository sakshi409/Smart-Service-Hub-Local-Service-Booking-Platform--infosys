import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Users, Wrench, Calendar, AlertCircle } from "lucide-react";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const BookingsOverview = () => {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <TrendingUp className="h-5 w-5" />, path: "/admin-dashboard" },
    { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin-dashboard/users" },
    { label: "Manage Providers", icon: <Wrench className="h-5 w-5" />, path: "/admin-dashboard/providers" },
    { label: "Booking Overview", icon: <Calendar className="h-5 w-5" />, path: "/admin-dashboard/bookings" },
    { label: "Complaints", icon: <AlertCircle className="h-5 w-5" />, path: "/admin-dashboard/complaints" },
  ];

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        console.log("Fetching bookings from:", `${BACKEND_URL}/api/admin/bookings`);
        const res = await fetch(`${BACKEND_URL}/api/admin/bookings`);
        
        console.log("Bookings response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Bookings API error:", errorText);
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Bookings fetched:", data.length);
        setBookings(data);
      } catch (error) {
        console.error("❌ Failed to load bookings:", error);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems} currentPath={location.pathname}>
      <h2 className="text-2xl font-bold mb-4">Booking Overview</h2>
      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-muted-foreground">No bookings found in the database.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.bookingId}>
                <TableCell>{booking.bookingId}</TableCell>
                <TableCell>{booking.userId}</TableCell>
                <TableCell>{booking.providerId}</TableCell>
                <TableCell>{booking.serviceType}</TableCell>
                <TableCell>{booking.bookingDate}</TableCell>
                <TableCell>{booking.bookingTime}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default BookingsOverview;

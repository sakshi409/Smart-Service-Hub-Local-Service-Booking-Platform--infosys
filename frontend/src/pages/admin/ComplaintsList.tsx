import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Users, Wrench, Calendar, AlertCircle } from "lucide-react";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const ComplaintsList = () => {
  const location = useLocation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <TrendingUp className="h-5 w-5" />, path: "/admin-dashboard" },
    { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin-dashboard/users" },
    { label: "Manage Providers", icon: <Wrench className="h-5 w-5" />, path: "/admin-dashboard/providers" },
    { label: "Booking Overview", icon: <Calendar className="h-5 w-5" />, path: "/admin-dashboard/bookings" },
    { label: "Complaints", icon: <AlertCircle className="h-5 w-5" />, path: "/admin-dashboard/complaints" },
  ];

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        console.log("Fetching complaints from:", `${BACKEND_URL}/api/admin/complaints`);
        const res = await fetch(`${BACKEND_URL}/api/admin/complaints`);
        
        console.log("Complaints response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("Complaints API error:", errorText);
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("✅ Complaints fetched:", data.length);
        setComplaints(data);
      } catch (error) {
        console.error("❌ Failed to load complaints:", error);
      }
      setLoading(false);
    };
    fetchComplaints();
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems} currentPath={location.pathname}>
      <h2 className="text-2xl font-bold mb-4">Complaints</h2>
      {loading ? (
        <p>Loading complaints...</p>
      ) : complaints.length === 0 ? (
        <p className="text-muted-foreground">No complaints found in the database.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Complaint ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Provider ID</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaints.map((c) => (
              <TableRow key={c.complaintId}>
                <TableCell>{c.complaintId}</TableCell>
                <TableCell>{c.userId}</TableCell>
                <TableCell>{c.providerId ?? "-"}</TableCell>
                <TableCell className="max-w-xs truncate">{c.message}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    c.status === 'OPEN' ? 'bg-red-100 text-red-800' :
                    c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {c.status}
                  </span>
                </TableCell>
                <TableCell className="max-w-xs truncate">{c.response ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </DashboardLayout>
  );
};

export default ComplaintsList;

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../components/DashboardLayout";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { TrendingUp, Users, Wrench, Calendar, AlertCircle } from "lucide-react";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const ManageUsers = () => {
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { label: "Dashboard", icon: <TrendingUp className="h-5 w-5" />, path: "/admin-dashboard" },
    { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin-dashboard/users" },
    { label: "Manage Providers", icon: <Wrench className="h-5 w-5" />, path: "/admin-dashboard/providers" },
    { label: "Booking Overview", icon: <Calendar className="h-5 w-5" />, path: "/admin-dashboard/bookings" },
    { label: "Complaints", icon: <AlertCircle className="h-5 w-5" />, path: "/admin-dashboard/complaints" },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const url = `${BACKEND_URL}/api/admin/users`;
        console.log("Fetching users from:", url);
        
        const res = await fetch(url);
        console.log("Response status:", res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error("API error response:", errorText);
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await res.text();
          console.error("Non-JSON response:", responseText);
          throw new Error('Response is not JSON');
        }
        
        const data = await res.json();
        console.log("✅ Users fetched successfully:", data);
        setUsers(data);
      } catch (error) {
        console.error("❌ Failed to load users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Helper function to get role display text and color
  const getRoleDisplay = (role) => {
    // Default to USER if role is null, undefined, or empty
    const userRole = role || 'USER';
    
    const roleConfig = {
      'USER': { label: 'USER', color: 'bg-blue-100 text-blue-800' },
      'SERVICEPROVIDER': { label: 'Service Provider', color: 'bg-green-100 text-green-800' },
      'ADMIN': { label: 'ADMIN', color: 'bg-purple-100 text-purple-800' }
    };

    return roleConfig[userRole] || { label: userRole, color: 'bg-gray-100 text-gray-800' };
  };

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems} currentPath={location.pathname}>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No users found in the database.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">User ID</TableHead>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[200px]">Email</TableHead>
                  <TableHead className="min-w-[130px]">Mobile</TableHead>
                  <TableHead className="min-w-[120px]">Location</TableHead>
                  <TableHead className="min-w-[150px]">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const roleDisplay = getRoleDisplay(user.role);
                  
                  return (
                    <TableRow key={user.userId}>
                      <TableCell className="font-medium">{user.userId}</TableCell>
                      <TableCell>{user.fullName || "N/A"}</TableCell>
                      <TableCell>{user.email || "N/A"}</TableCell>
                      <TableCell>{user.mobile || "N/A"}</TableCell>
                      <TableCell>{user.location || "-"}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${roleDisplay.color}`}>
                          {roleDisplay.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ManageUsers;

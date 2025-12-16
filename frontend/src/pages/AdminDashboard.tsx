import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { TrendingUp, Users, Wrench, Calendar, AlertCircle, Activity, Clock, CheckCircle } from "lucide-react";

// const BACKEND_URL = "http://localhost:8080";
const BACKEND_URL = import.meta.env.VITE_API_BASE || "http://localhost:8080";

const AdminDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    totalBookings: 0,
    activeComplaints: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        console.log("Fetching admin data from backend...");
        
        const [usersRes, providersRes, bookingsRes, complaintsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/admin/users`),
          fetch(`${BACKEND_URL}/api/admin/providers`),
          fetch(`${BACKEND_URL}/api/admin/bookings`),
          fetch(`${BACKEND_URL}/api/admin/complaints`),
        ]);

        console.log("Response statuses:", {
          users: usersRes.status,
          providers: providersRes.status,
          bookings: bookingsRes.status,
          complaints: complaintsRes.status
        });

        if (!usersRes.ok || !providersRes.ok || !bookingsRes.ok || !complaintsRes.ok) {
          throw new Error("Failed to fetch data from backend");
        }

        const users = await usersRes.json();
        const providers = await providersRes.json();
        const bookings = await bookingsRes.json();
        const complaints = await complaintsRes.json();

        setStats({
          totalUsers: users.length,
          totalProviders: providers.length,
          totalBookings: bookings.length,
          activeComplaints: complaints.filter(c => c.status === "OPEN" || c.status === "Active").length,
        });

        // Get recent users (last 5)
        setRecentUsers(users.slice(-5).reverse());
        
        // Get recent bookings (last 5)
        setRecentBookings(bookings.slice(-5).reverse());

      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
        setStats({
          totalUsers: 0,
          totalProviders: 0,
          totalBookings: 0,
          activeComplaints: 0,
        });
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <TrendingUp className="h-5 w-5" />, path: "/admin-dashboard" },
    { label: "Manage Users", icon: <Users className="h-5 w-5" />, path: "/admin-dashboard/users" },
    { label: "Manage Providers", icon: <Wrench className="h-5 w-5" />, path: "/admin-dashboard/providers" },
    { label: "Booking Overview", icon: <Calendar className="h-5 w-5" />, path: "/admin-dashboard/bookings" },
    { label: "Complaints", icon: <AlertCircle className="h-5 w-5" />, path: "/admin-dashboard/complaints" },
  ];

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems} currentPath={location.pathname}>
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted-foreground mb-6">Manage your platform effectively</p>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-lg text-muted-foreground">Loading overall stats...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalProviders}</p>
                  <p className="text-sm text-muted-foreground">Service Providers</p>
                </div>
                <Wrench className="h-8 w-8 text-accent" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{stats.activeComplaints}</p>
                  <p className="text-sm text-muted-foreground">Active Complaints</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Recent Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentUsers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No users yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {user.role || 'USER'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Recent Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.bookingId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium">{booking.serviceType}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.bookingDate} at {booking.bookingTime}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Completed bookings awaiting payment</p>
                    <p className="text-2xl font-bold">
                      {recentBookings.filter(b => b.status === 'COMPLETED').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Bookings</p>
                    <p className="text-2xl font-bold">
                      {recentBookings.filter(b => b.status === 'PENDING').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Providers</p>
                    <p className="text-2xl font-bold">{stats.totalProviders}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;

import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import Profile from "./user/Profile";
import SearchServices from "./user/SearchServices";
import MyBookings from "./user/MyBookings";
import Reviews from "./user/Reviews";
import { User, Search, Calendar, Star } from "lucide-react";

const UserDashboard = () => {
  const location = useLocation();

  const menuItems = [
    { label: "Profile", icon: <User className="h-5 w-5" />, path: "/user-dashboard" },
    { label: "Search Services", icon: <Search className="h-5 w-5" />, path: "/user-dashboard/search" },
    { label: "My Bookings", icon: <Calendar className="h-5 w-5" />, path: "/user-dashboard/bookings" },
    { label: "Reviews", icon: <Star className="h-5 w-5" />, path: "/user-dashboard/reviews" },
  ];

  return (
    <DashboardLayout
      title="User Dashboard"
      menuItems={menuItems}
      currentPath={location.pathname}
      userType="USER"
    >
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/search" element={<SearchServices />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="*" element={<Navigate to="/user-dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default UserDashboard;

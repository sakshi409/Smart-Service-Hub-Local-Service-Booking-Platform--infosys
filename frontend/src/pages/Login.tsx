import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Wrench, AlertCircle, CheckCircle2 } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showNotFoundDialog, setShowNotFoundDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    mobile: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    mobile: "",
    password: "",
    role: "",
  });

  // Validate form inputs
  const validateForm = () => {
    const newErrors = { mobile: "", password: "", role: "" };
    let isValid = true;

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Phone number is required";
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = "Phone number must be 10 digits";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || "Login failed";

        // ❌ SCENARIO 1: User not found (account doesn't exist)
        if (
          errorMessage.includes("Invalid credentials") ||
          errorMessage.includes("User not found")
        ) {
          setShowNotFoundDialog(true);
          return;
        }

        // ❌ SCENARIO 2: Wrong credentials
        toast({
          title: "Login Failed",
          description: "Invalid phone number or password. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // ✅ SCENARIO 3: Login successful
      localStorage.setItem("userData", JSON.stringify(data));
      setSuccessMessage(data.message || "Login successful");
      setShowSuccessDialog(true);

      // Auto-redirect after 1.5 seconds
      setTimeout(() => {
        navigate(data.redirectUrl);
      }, 1500);
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100"
    >
      {/* ❌ SCENARIO 1: User Not Found Dialog */}
      <AlertDialog open={showNotFoundDialog} onOpenChange={setShowNotFoundDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Account Not Found
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p className="text-base">
              This phone number is not registered with us. Please create a new account to get started.
            </p>
            <p className="text-sm text-gray-500">
              Phone: <span className="font-mono font-semibold">{formData.mobile}</span>
            </p>
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Back to Login</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => navigate("/signup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Account
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ SCENARIO 3: Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Welcome Back! 🎉
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="text-base">{successMessage}</p>
            <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
          </AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <Wrench className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>Login to your Smart Service Hub account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mobile Number Input */}
            <div className="space-y-2">
              <Label htmlFor="mobile">Phone Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={formData.mobile}
                onChange={(e) => {
                  setFormData({ ...formData, mobile: e.target.value });
                  setErrors({ ...errors, mobile: "" });
                }}
                disabled={isLoading}
                className={errors.mobile ? "border-red-500" : ""}
              />
              {errors.mobile && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.mobile}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
                disabled={isLoading}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Login as</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => {
                  setFormData({ ...formData, role: value });
                  setErrors({ ...errors, role: "" });
                }}
                disabled={isLoading}
              >
                <SelectTrigger className={errors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="SERVICE_PROVIDER">Service Provider</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign Up
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;


import ThreeBook from "@/components/ThreeBook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only redirect if authentication is confirmed and loading is complete
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-diary-light flex items-center justify-center">
        <p className="text-xl text-diary-purple">Loading...</p>
      </div>
    );
  }

  // If not authenticated, show the landing page with the 3D book
  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-diary-light">
      <ThreeBook />
    </div>
  );
};

export default Index;

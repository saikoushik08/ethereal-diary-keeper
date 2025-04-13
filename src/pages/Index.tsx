import { Button } from "@/components/ui/button";
import { Menu, ChevronRight } from "lucide-react";
import ThreeBook from "@/components/ThreeBook";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-foreground">Ethereal</span>
            <span className="text-2xl font-bold text-diary-purple">Diary</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost">Features</Button>
            <Button variant="ghost">About</Button>
            <Button variant="ghost">Contact</Button>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="md:hidden">
              <Menu size={20} />
            </Button>
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="bg-diary-purple text-white hover:bg-diary-purple/90 group"
            >
              Try It
              <ChevronRight 
                size={18} 
                className="ml-2 group-hover:translate-x-1 transition-transform" 
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Existing ThreeBook component with top margin for header */}
      <div className="pt-20 h-screen">
        <ThreeBook />
      </div>
    </div>
  );
};

export default Index;

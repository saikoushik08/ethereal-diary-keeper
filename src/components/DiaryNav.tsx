import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Bookmark, 
  Calendar, 
  Home, 
  LineChart, 
  LogOut, 
  Menu, 
  PenSquare, 
  Settings, 
  User, 
  X 
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const DiaryNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, profile, logout } = useAuth();
  const isMobile = useIsMobile();
  
  const navItems = [
    { 
      path: "/dashboard", 
      label: "Dashboard", 
      icon: <Home size={20} /> 
    },
    { 
      path: "/entry", 
      label: "Write", 
      icon: <PenSquare size={20} /> 
    },
    { 
      path: "/entries", 
      label: "Entries", 
      icon: <BookOpen size={20} /> 
    },
    { 
      path: "/calendar", 
      label: "Calendar", 
      icon: <Calendar size={20} /> 
    },
    { 
      path: "/reports", 
      label: "Reports", 
      icon: <LineChart size={20} /> 
    },
    { 
      path: "/saved", 
      label: "Saved", 
      icon: <Bookmark size={20} /> 
    },
    { 
      path: "/profile", 
      label: "Profile", 
      icon: <User size={20} /> 
    },
    { 
      path: "/settings", 
      label: "Settings", 
      icon: <Settings size={20} /> 
    },
  ];
  
  const isActive = (path: string) => {
    // Special case for entry creation
    if (path === "/entry" && location.pathname.includes("/entry/")) {
      return true;
    }
    return location.pathname === path;
  };
  
  const toggleNav = () => {
    setIsOpen(!isOpen);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 bg-diary-purple text-white p-2 rounded-md dark:bg-gray-700"
        onClick={toggleNav}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar/Navigation */}
      <aside className={`
        fixed top-0 left-0 h-full w-16 md:w-16 lg:w-56 
        bg-white border-r border-gray-200 transition-transform duration-300 z-40 
        dark:bg-gray-800 dark:border-gray-700
        ${isOpen || !isMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="h-full flex flex-col">
          <div className="py-6 px-3 md:px-3 lg:px-4 flex items-center justify-center lg:justify-start">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-md bg-diary-purple flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="hidden lg:inline-block font-semibold text-xl dark:text-white">Diary</span>
            </Link>
          </div>
          
          <div className="flex-1 py-4 overflow-y-auto">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center space-x-2 py-3 px-2 lg:px-4 rounded-md
                    ${isActive(item.path) 
                      ? "bg-diary-lavender text-diary-purple dark:bg-gray-700 dark:text-purple-400" 
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"}
                  `}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  <div className="w-6 flex justify-center">{item.icon}</div>
                  <span className="hidden lg:inline-block">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="border-t border-gray-200 p-4 dark:border-gray-700">
            <div className="hidden lg:flex items-center space-x-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || "U"}`} alt={profile?.username || "User"} />
                <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <div className="text-sm font-medium dark:text-white">{profile?.username || "User"}</div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-center lg:justify-start text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={handleLogout}
            >
              <LogOut size={18} className="lg:mr-2" />
              <span className="hidden lg:inline-block">Logout</span>
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

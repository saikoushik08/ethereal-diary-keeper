
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookText,
  BarChart,
  Settings,
  LogOut,
  User,
  Search,
  Home,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const DiaryNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/diary", label: "Daily Entries", icon: <BookText size={20} /> },
    { path: "/reports", label: "AI Reports", icon: <BarChart size={20} /> },
    { path: "/explore", label: "Explore", icon: <Search size={20} /> },
    { path: "/chat", label: "Contact Us", icon: <MessageSquare size={20} /> },
    { path: "/settings", label: "Settings", icon: <Settings size={20} /> },
    { path: "/profile", label: "Profile", icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div 
      className={`fixed h-screen ${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-20`}
    >
      <div className="p-4 flex items-center justify-between border-b">
        {!collapsed && (
          <div className="text-2xl font-serif font-bold">
            <span className="text-diary-purple">Dear</span>
            <span className="text-diary-dark">Diary</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          )}
        </Button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link to={item.path}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className={`w-full justify-start ${
                    location.pathname === item.path
                      ? "bg-diary-lavender text-diary-purple"
                      : ""
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-8 left-0 right-0 px-4">
        <Button
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut size={20} className="mr-2" />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );
};

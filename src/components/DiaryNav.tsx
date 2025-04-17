
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
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export const DiaryNav = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically collapse sidebar on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40">
        <div className="text-2xl font-serif font-bold">
          <span className="text-diary-purple">Dear</span>
          <span className="text-diary-dark">Diary</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-diary-dark"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobile && (
        <div 
          className={`fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ${
            mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - transforms for mobile */}
      <div 
        className={`fixed h-screen ${
          collapsed ? "w-20" : "w-64"
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-30
        ${isMobile ? (mobileMenuOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
        ${isMobile ? "top-0" : "top-0"}`}
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
            className={`${!collapsed || isMobile ? "ml-auto" : "mx-auto"}`}
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

        <nav className="p-4 mt-4 md:mt-0">
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
                    <span className={`${!collapsed || isMobile ? "mr-2" : ""}`}>{item.icon}</span>
                    {(!collapsed || (isMobile && mobileMenuOpen)) && <span>{item.label}</span>}
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
            <LogOut size={20} className={`${!collapsed || isMobile ? "mr-2" : ""}`} />
            {(!collapsed || (isMobile && mobileMenuOpen)) && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

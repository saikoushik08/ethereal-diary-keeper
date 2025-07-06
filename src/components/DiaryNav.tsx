import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookText,
  BarChart,
  Settings as SettingsIcon,
  LogOut,
  User,
  Search,
  Home,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
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

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <Home size={20} /> },
    { path: "/diary", label: "Daily Entries", icon: <BookText size={20} /> },
    { path: "/reports", label: "AI Reports", icon: <BarChart size={20} /> },
    { path: "/explore", label: "Explore", icon: <Search size={20} /> },
    { path: "/chat", label: "Contact Us", icon: <MessageSquare size={20} /> },
    { path: "/settings", label: "Settings", icon: <SettingsIcon size={20} /> },
    { path: "/profile", label: "Profile", icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();       // ✅ Ensure logout completes
      navigate("/");        // ✅ Then navigate to home
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <>
      {/* Mobile Header */}
      <div
        className="
          md:hidden fixed top-0 left-0 right-0 h-16
          bg-background dark:bg-[#111827]
          border-b border-border
          flex items-center justify-between px-4 z-40
        "
      >
        <div className="text-2xl font-serif font-bold text-primary dark:text-white">
          <span>Dear</span>
          <span className="text-primary-foreground dark:text-white">Diary</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMobileMenu}
          className="text-foreground dark:text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobile && (
        <div
          className={`
            fixed inset-0 bg-black/50 z-30 transition-opacity duration-300
            ${mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          `}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed h-screen top-0
          ${collapsed ? "w-20" : "w-64"}
          bg-background dark:bg-[#111827]
          border-r border-border
          transition-all duration-300 ease-in-out z-30
          ${isMobile
            ? mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"}
        `}
      >
        {/* Header: Logo + Collapse Button */}
        <div
          className={`h-16 px-4 flex items-center border-b border-border ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <div className="text-2xl font-serif font-bold text-primary dark:text-white">
              <span>Dear</span>
              <span className="text-primary-foreground dark:text-white">
                Diary
              </span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground dark:text-white"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </Button>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 mt-4 md:mt-0">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link to={item.path}>
                  <Button
                    variant={
                      location.pathname === item.path ? "secondary" : "ghost"
                    }
                    className={`
                      w-full justify-start
                      ${
                        location.pathname === item.path
                          ? "bg-diary-lavender dark:bg-diary-gray text-diary-purple dark:text-white"
                          : "text-foreground dark:text-white"
                      }
                    `}
                  >
                    <span className={`${!collapsed || isMobile ? "mr-2" : ""}`}>
                      {item.icon}
                    </span>
                    {(!collapsed || (isMobile && mobileMenuOpen)) && (
                      <span>{item.label}</span>
                    )}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="absolute bottom-8 left-0 right-0 px-4">
          <Button
            variant="outline"
            className="w-full justify-start text-destructive dark:text-white dark:border-white hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut
              size={20}
              className={`${!collapsed || isMobile ? "mr-2" : ""}`}
            />
            {(!collapsed || (isMobile && mobileMenuOpen)) && (
              <span>Logout</span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

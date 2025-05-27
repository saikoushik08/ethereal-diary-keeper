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
    { path: "/settings", label: "Settings", icon: <SettingsIcon size={20} /> },
    { path: "/profile", label: "Profile", icon: <User size={20} /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
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

      {/* Mobile Menu Overlay */}
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
          fixed h-screen
          ${collapsed ? "w-20" : "w-64"}
          bg-background dark:bg-[#111827]
          border-r border-border
          transition-all duration-300 ease-in-out z-30
          ${isMobile
            ? mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"}
          top-0
        `}
      >
        <div className="p-4 flex items-center justify-between border-b border-border">
          {!collapsed && (
            <div className="text-2xl font-serif font-bold text-primary dark:text-white">
              <span>Dear</span>
              <span className="text-primary-foreground dark:text-white">
                Diary
              </span>
            </div>
          )}

          {/* Collapse Toggle */}
          <Button
            variant="ghost"
            className={`
              inline-flex items-center justify-center gap-2 whitespace-nowrap
              rounded-md text-sm font-medium
              ring-offset-background transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              disabled:pointer-events-none disabled:opacity-50
              [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0
              hover:bg-accent hover:text-accent-foreground
              h-12 w-12
              ${!collapsed || isMobile ? "ml-auto" : "mx-auto"}
              text-foreground dark:text-white
            `}
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-right"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-chevron-left"
              >
                <path d="m15 18-6-6 6-6" />
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
            {(!collapsed || (isMobile && mobileMenuOpen)) && <span>Logout</span>}
          </Button>
        </div>
      </div>
    </>
  );
};

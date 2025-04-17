import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  BookOpenText, 
  BarChart2, 
  Settings, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home 
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export const DiaryNav = () => {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when window is resized to desktop view
  useEffect(() => {
    const handleResize = () => {
      if (!isMobile && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isMenuOpen]);

  // Create navigation items
  const navItems = [
    { to: "/dashboard", icon: <Home size={20} />, label: "Dashboard" },
    { to: "/diary", icon: <BookOpenText size={20} />, label: "My Diary" },
    { to: "/reports", icon: <BarChart2 size={20} />, label: "Reports" },
    { to: "/profile", icon: <User size={20} />, label: "Profile" },
    { to: "/settings", icon: <Settings size={20} />, label: "Settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Mobile navigation
  if (isMobile) {
    return (
      <>
        {/* Fixed top bar */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between z-20 px-4">
          <Link to="/dashboard" className="text-xl font-serif font-medium text-diary-purple dark:text-purple-300">
            My Diary
          </Link>
          
          <div className="flex items-center">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="ml-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="fixed inset-0 bg-white dark:bg-gray-900 z-10 pt-16 pb-4 px-4 flex flex-col h-full">
            <nav className="flex-1">
              <ul className="space-y-2 pt-4">
                {navItems.map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={`flex items-center p-3 rounded-lg 
                        ${pathname.startsWith(item.to) 
                          ? "bg-diary-lavender text-diary-purple dark:bg-purple-900/30 dark:text-purple-300" 
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <Button 
              variant="ghost" 
              className="flex items-center justify-center w-full border-t dark:border-gray-800 pt-4 text-gray-600 dark:text-gray-400" 
              onClick={handleLogout}
            >
              <LogOut size={20} className="mr-2" />
              <span>Log Out</span>
            </Button>
          </div>
        )}
      </>
    );
  }

  // Desktop navigation
  return (
    <div className="fixed left-0 top-0 bottom-0 w-16 md:w-16 lg:w-56 flex flex-col bg-white dark:bg-gray-900 border-r dark:border-gray-800 z-10">
      <div className="p-4 lg:p-6">
        <Link to="/dashboard" className="hidden lg:block text-xl font-serif font-medium text-diary-purple dark:text-purple-300">
          My Diary
        </Link>
      </div>
      
      <nav className="flex-1 overflow-auto">
        <ul className="space-y-2 p-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center p-3 rounded-lg 
                  ${pathname.startsWith(item.to) 
                    ? "bg-diary-lavender text-diary-purple dark:bg-purple-900/30 dark:text-purple-300" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                title={item.label}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="hidden lg:inline font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t dark:border-gray-800 flex flex-col items-center justify-center">
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="mt-2"
          title="Log Out"
        >
          <LogOut size={20} />
          <span className="sr-only">Log Out</span>
        </Button>
      </div>
    </div>
  );
};

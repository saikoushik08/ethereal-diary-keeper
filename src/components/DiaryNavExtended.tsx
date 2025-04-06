
import { NavLink } from "react-router-dom";
import { 
  BookOpen, 
  LineChart, 
  Settings, 
  User, 
  Pencil,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/context/AuthContext";

export const DiaryNavExtended = () => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { label: "Dashboard", icon: <BookOpen className="h-5 w-5" />, path: "/dashboard" },
    { label: "New Entry", icon: <Pencil className="h-5 w-5" />, path: "/diary" },
    { label: "Reports", icon: <LineChart className="h-5 w-5" />, path: "/reports" },
    { label: "Settings", icon: <Settings className="h-5 w-5" />, path: "/settings" },
    { label: "Profile", icon: <User className="h-5 w-5" />, path: "/profile" }
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-diary-dark dark:border-gray-800 border-r border-gray-200 flex flex-col shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <h2 className="text-xl font-serif font-medium text-diary-purple dark:text-white">ethereal-diary-keeper</h2>
      </div>
      
      <div className="flex-grow py-8 px-4">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center p-3 rounded-lg text-sm transition-colors ${
                  isActive ? 
                  'bg-diary-lavender dark:bg-diary-purple/20 text-diary-purple dark:text-white font-medium' : 
                  'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-9 w-9 mr-2">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-diary-lavender text-diary-purple dark:bg-diary-purple/20 dark:text-white">
                {user?.name?.substring(0, 2).toUpperCase() || "DP"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
        
        <button 
          onClick={logout}
          className="w-full flex items-center p-3 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

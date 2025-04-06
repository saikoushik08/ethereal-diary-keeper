
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="h-9 w-9 rounded-md transition-colors"
    >
      {isDarkMode ? 
        <Sun className="h-5 w-5 text-gray-200" /> : 
        <Moon className="h-5 w-5 text-gray-700" />
      }
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

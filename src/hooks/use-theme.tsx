
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export const useThemeToggle = () => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error("useThemeToggle must be used within a ThemeProvider");
  }
  
  return context;
};


import { DiaryNav } from "@/components/DiaryNav";
import { DiaryEditor } from "@/components/DiaryEditor";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const DiaryEntry = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Adjust content padding based on screen size
  const contentClass = isMobile 
    ? "pt-20 px-4 pb-8 w-full" 
    : "pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8";

  return (
    <div className="min-h-screen bg-white">
      <DiaryNav />
      
      <div className={contentClass}>
        <h1 className="text-2xl md:text-3xl font-serif font-medium mb-4 md:mb-6">New Entry</h1>
        
        <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm">
          <DiaryEditor />
        </div>
      </div>
    </div>
  );
};

export default DiaryEntry;

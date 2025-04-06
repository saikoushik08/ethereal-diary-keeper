
import { DiaryNavExtended } from "@/components/DiaryNavExtended";
import { DiaryEditor } from "@/components/DiaryEditor";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";

const DiaryEntry = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-diary-dark">
      <DiaryNavExtended />
      
      <div className="pl-64 pt-8 pr-8 pb-8">
        <h1 className="text-3xl font-serif font-medium mb-6 dark:text-white">New Entry</h1>
        
        <div className="bg-white dark:bg-diary-dark dark:border dark:border-gray-800 p-6 rounded-lg shadow-sm">
          <DiaryEditor />
        </div>
      </div>
    </div>
  );
};

export default DiaryEntry;

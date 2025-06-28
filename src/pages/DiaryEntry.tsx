
import { DiaryNav } from "@/components/DiaryNav";
import { DiaryEditor } from "@/components/DiaryEditor";
import { useAuth } from "@/context/AuthContext";
import { Navigate, useParams, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}

const DiaryEntry = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const { id } = useParams();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [isNewEntry, setIsNewEntry] = useState(!id);
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Fetch entry if ID is provided
  useEffect(() => {
    const fetchEntry = async () => {
      if (id && user) {
        try {
          const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            throw error;
          }

          if (data) {
            setEntry(data as Entry);
          } else {
            toast({
              title: "Entry not found",
              description: "The requested diary entry could not be found.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.error("Error fetching entry:", error);
          toast({
            title: "Error",
            description: "Failed to load diary entry. Please try again.",
            variant: "destructive"
          });
        }
      }
    };

    if (id) {
      fetchEntry();
    } else {
      setIsNewEntry(true);
    }
  }, [id, user]);
  
  // Adjust content padding based on screen size
  const contentClass = isMobile 
    ? "pt-20 px-4 pb-8 w-full" 
    : "pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8";

  return (
    <div className="min-h-screen bg-white dark:bg-[#111827]">
      <DiaryNav />
      
      <div className={contentClass}>
        {isNewEntry ? (
          <>
            <div className="flex items-center mb-4 md:mb-6">
              <Link to="/diary">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-serif font-medium">New Entry</h1>
            </div>
            
            <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm dark:bg-[#111827]">
              <DiaryEditor existingEntry={null} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center mb-4 md:mb-6">
              <Link to="/diary">
                <Button variant="ghost" size="icon" className="mr-2">
                  <ArrowLeft size={20} />
                </Button>
              </Link>
              <h1 className="text-2xl md:text-3xl font-serif font-medium">
                {entry?.title || "Loading entry..."}
              </h1>
            </div>
            
            <div className="bg-white p-3 md:p-6 rounded-lg shadow-sm dark:bg-[#020817] ">
              {entry ? (
                <DiaryEditor existingEntry={entry} />
              ) : (
                <div className="text-center py-12">
                  <div className="animate-pulse bg-gray-200 h-8 w-3/4 mx-auto mb-4 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-full mx-auto mb-2 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-full mx-auto mb-2 rounded"></div>
                  <div className="animate-pulse bg-gray-200 h-4 w-2/3 mx-auto rounded"></div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DiaryEntry;

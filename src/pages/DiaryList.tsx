import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, Calendar, Clock, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface Entry {
  id: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  created_at: string;
}

const DiaryList = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const isMobile = useIsMobile();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading2, setIsLoading2] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const fetchEntries = async () => {
      if (user) {
        try {
          setIsLoading2(true);
          const { data, error } = await supabase
            .from("entries")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          if (error) throw error;
          setEntries((data as Entry[]) || []);
        } catch (error) {
          console.error("Error fetching entries:", error);
          toast({
            title: "Error",
            description: "Failed to load diary entries. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading2(false);
        }
      }
    };

    fetchEntries();
  }, [user, toast]);

  const filteredEntries = entries.filter((entry) =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.tags && entry.tags.some((tag) =>
      tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      happy: "😄",
      calm: "😌",
      neutral: "😐",
      sad: "😔",
      anxious: "😰",
      angry: "😠",
    };
    return emojis[mood] || "😐";
  };

  const contentClass = isMobile
    ? "pt-20 px-4 pb-8 w-full"
    : "pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8";

  return (
    <div className="min-h-screen bg-background dark:bg-[#111827] text-foreground dark:text-white">
      <DiaryNav />

      <div className={contentClass}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-serif font-medium mb-4 md:mb-0">
            Diary Entries
          </h1>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search entries..."
                className="pl-9 w-full md:w-64 bg-white dark:bg-card dark:text-card-foreground"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Link to="/diary/new">
              <Button className="w-full md:w-auto bg-diary-purple hover:bg-diary-purple/90">
                <PlusCircle size={18} className="mr-2" />
                New Entry
              </Button>
            </Link>
          </div>
        </div>

        {isLoading2 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-card dark:text-card-foreground p-6 rounded-lg shadow-sm animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredEntries.length > 0 ? (
              <div className="space-y-4">
                {filteredEntries.map((entry) => (
                  <Link key={entry.id} to={`/diary/${entry.id}`}>
                    <div className="bg-white dark:bg-card dark:text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-border">
                      <div className="flex justify-between mb-2">
                        <h2 className="text-xl font-medium">{entry.title}</h2>
                        <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center">
                          <Calendar size={14} className="mr-1" />
                          {format(new Date(entry.created_at), "MMMM d, yyyy")}
                        </span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {format(new Date(entry.created_at), "h:mm a")}
                        </span>
                      </div>

                      <p className="line-clamp-2">{entry.content}</p>

                      {entry.tags && entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {entry.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="bg-gray-100 dark:bg-card-foreground text-gray-600 dark:text-card pl-2 pr-2 py-1 rounded-full flex items-center text-xs"
                            >
                              <Tag size={10} className="mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-card dark:text-card-foreground rounded-lg shadow-sm">
                <PlusCircle size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h2 className="text-xl font-medium mb-2">No entries yet</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Start journaling to see your entries here
                </p>
                <Link to="/diary/new">
                  <Button className="bg-diary-purple hover:bg-diary-purple/90">
                    <PlusCircle size={18} className="mr-2" />
                    Create Your First Entry
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DiaryList;

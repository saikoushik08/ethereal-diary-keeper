
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookText, BarChart, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Mock data for recent entries
  const recentEntries = [
    { id: "1", title: "Morning Reflections", date: "2025-04-06", mood: "happy" },
    { id: "2", title: "Project Brainstorming", date: "2025-04-05", mood: "neutral" },
    { id: "3", title: "Evening Thoughts", date: "2025-04-03", mood: "calm" },
  ];

  // Mock data for mood distribution
  const moodData = [
    { mood: "Happy", count: 12, color: "#4ade80" },
    { mood: "Calm", count: 8, color: "#60a5fa" },
    { mood: "Neutral", count: 15, color: "#94a3b8" },
    { mood: "Sad", count: 3, color: "#a78bfa" },
    { mood: "Anxious", count: 5, color: "#facc15" },
    { mood: "Angry", count: 2, color: "#f87171" },
  ];

  // Get emoji for mood
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

  // Adjust content padding based on screen size and sidebar state
  const contentClass = isMobile 
    ? "pt-20 px-4 pb-8 w-full" 
    : "pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8";

  return (
    <div className="min-h-screen bg-gray-50">
      <DiaryNav />
      
      <div className={contentClass}>
        <header className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-serif font-medium">
            Hello, <span className="text-diary-purple">{user?.username || "there"}</span>
          </h1>
          <p className="text-sm md:text-base text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/diary">
                  <Button className="w-full justify-start bg-diary-purple hover:bg-diary-purple/90">
                    <PlusCircle size={18} className="mr-2" />
                    New Entry
                  </Button>
                </Link>
                <Link to="/reports">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart size={18} className="mr-2" />
                    View Reports
                  </Button>
                </Link>
                <Link to="/diary">
                  <Button variant="outline" className="w-full justify-start">
                    <BookText size={18} className="mr-2" />
                    All Entries
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {recentEntries.length > 0 ? (
                <div className="space-y-2">
                  {recentEntries.map((entry) => (
                    <Link 
                      key={entry.id}
                      to={`/diary/${entry.id}`}
                      className="block p-3 rounded-md hover:bg-gray-50 border border-gray-100"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm md:text-base truncate max-w-[160px] md:max-w-[200px]">{entry.title}</div>
                          <div className="text-xs md:text-sm text-gray-500">{entry.date}</div>
                        </div>
                        <div className="text-xl">{getMoodEmoji(entry.mood)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <BookText size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No entries yet. Start writing!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">{recentEntries.length}</div>
                  <div className="text-xs md:text-sm text-gray-500">Entries</div>
                </div>
                <Calendar size={36} className="text-diary-purple opacity-80" />
              </div>
              
              <div className="space-y-2">
                <div className="text-xs md:text-sm font-medium mb-1">Mood Distribution</div>
                {moodData.map((item) => (
                  <div key={item.mood} className="flex items-center">
                    <div 
                      className="w-2 md:w-3 h-2 md:h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="text-xs md:text-sm flex-1">{item.mood}</div>
                    <div 
                      className="h-1.5 md:h-2 bg-gray-100 flex-grow mx-2 rounded-full overflow-hidden"
                    >
                      <div 
                        className="h-full rounded-full"
                        style={{ 
                          width: `${(item.count / moodData.reduce((acc, curr) => acc + curr.count, 0)) * 100}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                    <div className="text-xs md:text-sm text-gray-500 w-6 md:w-8 text-right">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

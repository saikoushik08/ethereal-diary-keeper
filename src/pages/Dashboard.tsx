import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlusCircle,
  BookText,
  BarChart,
  Calendar,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

// Register Chart.js components
ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const Dashboard = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showProfile, setShowProfile] = useState(false);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  const recentEntries = [
    { id: "1", title: "Morning Reflections", date: "2025-04-06", mood: "happy" },
    { id: "2", title: "Project Brainstorming", date: "2025-04-05", mood: "neutral" },
    { id: "3", title: "Evening Thoughts", date: "2025-04-03", mood: "calm" },
  ];

  const moodData = [
    { mood: "Happy", count: 12, color: "#4ade80" },
    { mood: "Calm", count: 8, color: "#60a5fa" },
    { mood: "Neutral", count: 15, color: "#94a3b8" },
    { mood: "Sad", count: 3, color: "#a78bfa" },
    { mood: "Anxious", count: 5, color: "#facc15" },
    { mood: "Angry", count: 2, color: "#f87171" },
  ];

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const moodChartData = {
    labels: moodData.map((item) => item.mood),
    datasets: [
      {
        data: moodData.map((item) => item.count),
        backgroundColor: moodData.map((item) => item.color),
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#111827] text-foreground dark:text-white bg-cover bg-center">
      <DiaryNav />

      <div className={contentClass}>
        <header className="mb-10 md:mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium">
            {getGreeting()},{" "}
            <span className="text-diary-purple dark:text-diary-purple">
              {profile?.username || "there"}
            </span>{" "}
            👋
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mt-4">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        {/* Quick Actions */}
        <Card className="bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md transition-shadow w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Link to="/diary/new">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
          {/* Recent Entries */}
          <Card className="bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md transition-shadow w-full">
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
                      className="block p-3 rounded-md hover:bg-gray-50 dark:hover:bg-card border border-gray-100 dark:border-border"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-sm md:text-base truncate max-w-[200px]">
                            {entry.title}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                            {entry.date}
                          </div>
                        </div>
                        <div className="text-xl">{getMoodEmoji(entry.mood)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <BookText size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No entries yet. Start writing!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mood Chart */}
          <Card className="bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md transition-shadow w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {recentEntries.length}
                  </div>
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                    Entries
                  </div>
                </div>
                <Calendar size={36} className="text-diary-purple opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="text-xs md:text-sm font-medium mb-1">
                  Mood Distribution
                </div>
                <Pie data={moodChartData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile modal toggle */}
      <Button
        className="fixed top-4 right-4 md:right-6 z-40 bg-white dark:bg-card text-diary-purple dark:text-white hover:bg-white/90 dark:hover:bg-card/80 rounded-full w-10 h-10 p-0"
        onClick={() => setShowProfile(true)}
      >
        <User size={20} />
      </Button>

      {/* Profile modal */}
      {showProfile && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setShowProfile(false
          )}
        >
          <div
            className="bg-white dark:bg-card dark:text-card-foreground rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowProfile(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <Avatar>
                <AvatarImage src="/path/to/default-avatar.jpg" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-medium">{profile?.username || "User"}</h3>
            </div>
            <div className="space-y-2">
              <Link to="/profile">
                <Button className="w-full">View Full Profile</Button>
              </Link>
              <Link to="/settings">
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

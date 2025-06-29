// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookText, BarChart, Calendar, User, X } from "lucide-react";
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
import { format, isSameMonth } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

interface Entry {
  id: string;
  title: string;
  mood: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, isAuthenticated, isLoading, logout } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  // Redirect if not logged in
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Fetch all entries for this user
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("entries")
        .select("id, title, mood, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setEntries(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user, toast]);

  // "Recent Entries": top 3
  const recentEntries = entries.slice(0, 3);

  // "This Month" stats + pie chart
  const now = new Date();
  const monthEntries = entries.filter(e =>
    isSameMonth(new Date(e.created_at), now)
  );
  const moodCounts = monthEntries.reduce<Record<string, number>>((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});
  const moodLabels = Object.keys(moodCounts);
  const moodData = moodLabels.map(label => moodCounts[label]);
  const moodColors = ["#4ade80", "#60a5fa", "#94a3b8", "#a78bfa", "#facc15", "#f87171"].slice(0, moodLabels.length);
  const chartData = {
    labels: moodLabels.map(m => m[0].toUpperCase() + m.slice(1)),
    datasets: [{ data: moodData, backgroundColor: moodColors, hoverOffset: 4 }],
  };

  const getMoodEmoji = (mood: string) => ({
    happy: "😄",
    calm: "😌",
    neutral: "😐",
    sad: "😔",
    anxious: "😰",
    angry: "😠",
  }[mood] || "😐");

  const contentClass = isMobile
    ? "pt-20 px-4 pb-8 w-full"
    : "pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8";

  return (
    <div className="min-h-screen bg-background dark:bg-[#111827] text-foreground dark:text-white">
      <DiaryNav />

      <div className={contentClass}>
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-medium">
            {new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening"}
            ,{" "}
            <span className="text-diary-purple dark:text-diary-purple">
              {profile?.username || "there"}
            </span> 👋
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
        <Card className="mb-6 bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Link to="/diary/new">
                <Button className="w-full justify-start bg-diary-purple hover:bg-diary-purple/90">
                  <PlusCircle size={18} className="mr-2" /> New Entry
                </Button>
              </Link>
              <Link to="/reports">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart size={18} className="mr-2" /> View Reports
                </Button>
              </Link>
              <Link to="/diary">
                <Button variant="outline" className="w-full justify-start">
                  <BookText size={18} className="mr-2" /> All Entries
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Recent Entries */}
          <Card className="bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading…</p>
              ) : recentEntries.length > 0 ? (
                recentEntries.map(e => (
                  <Link
                    key={e.id}
                    to={`/diary/${e.id}`}
                    className="block p-3 rounded-md hover:bg-gray-50 dark:hover:bg-card border border-gray-100 dark:border-border mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-base truncate max-w-[200px]">
                          {e.title}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(e.created_at), "PPPp")}
                        </div>
                      </div>
                      <div className="text-xl">{getMoodEmoji(e.mood)}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Calendar size={48} className="mx-auto mb-2 opacity-30" />
                  <p>No entries yet. Start writing!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="bg-white dark:bg-card dark:text-card-foreground shadow-sm hover:shadow-md w-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {monthEntries.length}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Entries
                  </div>
                </div>
                <Calendar size={36} className="text-diary-purple opacity-80" />
              </div>
              <div className="space-y-2">
                <div className="text-xs font-medium mb-1">Mood Distribution</div>
                <Pie data={chartData} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Profile button */}
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
          onClick={() => setShowProfile(false)}
        >
          <div
            className="bg-white dark:bg-card dark:text-card-foreground rounded-lg shadow-xl p-6 max-w-sm w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Profile</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowProfile(false)}>
                <X size={18} />
              </Button>
            </div>
            <div className="flex flex-col items-center mb-6">
              <Avatar className="mb-4">
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
              <Button
                variant="destructive"
                className="w-full mt-2"
                onClick={() => {
                  logout();
                  setShowProfile(false);
                }}
              >
                Log Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

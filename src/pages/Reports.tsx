import LiveMoodLineChart from "@/components/LiveMoodLineChart";
import { toZonedTime } from "date-fns-tz";
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  LineChart as LineChartIcon,
  PieChart,
  BarChart2,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/lib/supabase/client";
import {
  format,
  startOfWeek,
  endOfWeek,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

interface WeeklyReport {
  id: number;
  dateRange: string;
  startDate: Date;
  endDate: Date;
  daysWithEntries: number[];
  summary: string;
  weekOverview?: {
    totalEntries: number;
    avgWordsPerEntry: number;
    moodTrend: string;
    accomplishedTasks: number;
    pendingTasks: number;
  };
  moodByDate?: { date: string; moodScore: number | null }[];
}

const Reports = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [weeklyReports, setWeeklyReports] = useState<WeeklyReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    const generateWeeklyReports = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch entries from the last 4 weeks
        const { data: entries, error } = await supabase
          .from("entries")
          .select("id, created_at, mood, content")
          .eq("user_id", user.id)
          .gte("created_at", subWeeks(new Date(), 4).toISOString())
          .order("created_at", { ascending: false });
        if (error) {
          console.error("❌ Supabase fetch error:", error);
        } else {
          console.log("✅ Supabase fetched entries:", entries);
        }

        if (error) throw error;
        console.log("Fetched entries:", entries);

        const reports: WeeklyReport[] = [];

        for (let i = 0; i < 4; i++) {
          const referenceDate = subWeeks(new Date(), i);
          const startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
          const endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });

          if (i === 0) {
            console.log("📅 Current Week Range:", {
              start: startDate.toISOString(),
              end: endDate.toISOString(),
            });
          }

          const dateRange = `${format(startDate, "MMMM d")} - ${format(
            endDate,
            "MMMM d, yyyy"
          )}`;

          const entriesThisWeek =
            entries?.filter((entry) => {
              const entryDateInIST = toZonedTime(
                entry.created_at,
                "Asia/Kolkata"
              );
              return entryDateInIST >= startDate && entryDateInIST <= endDate;
            }) || [];

          if (i === 0) {
            console.log("📝 Entries in current week:", entriesThisWeek);
          }

          const daysWithEntries = entriesThisWeek.map((entry) =>
            new Date(entry.created_at).getDate()
          );

          let summary = "No entries this week.";
          let dominantMood = "";
          let weekOverview = undefined;

          // ✅ Mood mapping (string to score)
          const moodMap: Record<string, number> = {
            happy: 5,
            excited: 5,
            content: 4,
            okay: 3,
            neutral: 3,
            tired: 2,
            sad: 2,
            angry: 1,
            stressed: 1,
          };

          // ✅ Create moodByDate array
          const moodByDate = eachDayOfInterval({
            start: startDate,
            end: endDate,
          }).map((date) => {
            const entriesForDay = entriesThisWeek.filter((entry) =>
              isSameDay(toZonedTime(entry.created_at, "Asia/Kolkata"), date)
            );

            const scores = entriesForDay.map((entry) => {
              const moodRaw = entry.mood?.toString().toLowerCase();
              return moodMap[moodRaw] ?? 3;
            });

            const moodScore =
              scores.length > 0
                ? Math.round(
                    (scores.reduce((a, b) => a + b, 0) / scores.length) * 10
                  ) / 10
                : null;

            return {
              date: format(date, "MMM dd"),
              moodScore,
            };
          });

          if (entriesThisWeek.length > 0) {
            const moodCounts: Record<string, number> = {};
            entriesThisWeek.forEach((entry) => {
              const mood = entry.mood?.toString().toLowerCase() || "";
              moodCounts[mood] = (moodCounts[mood] || 0) + 1;
            });

            let maxCount = 0;
            for (const mood in moodCounts) {
              if (moodCounts[mood] > maxCount) {
                maxCount = moodCounts[mood];
                dominantMood = mood;
              }
            }

            summary = `You wrote ${entriesThisWeek.length} ${
              entriesThisWeek.length === 1 ? "entry" : "entries"
            } this week. Your dominant mood was ${dominantMood}.`;

            if (i === 0) {
              const totalWords = entriesThisWeek.reduce((sum, entry) => {
                return (
                  sum +
                  (entry.content ? entry.content.trim().split(/\s+/).length : 0)
                );
              }, 0);

              const avgWordsPerEntry = Math.round(
                totalWords / entriesThisWeek.length
              );

              weekOverview = {
                totalEntries: entriesThisWeek.length,
                avgWordsPerEntry,
                moodTrend: dominantMood,
                accomplishedTasks: 0,
                pendingTasks: 0,
              };
            }
          }

          reports.push({
            id: i + 1,
            dateRange,
            startDate,
            endDate,
            daysWithEntries,
            summary,
            weekOverview,
            moodByDate, // ✅ now included properly
          });
        }

        setWeeklyReports(reports);
      } catch (error) {
        console.error("Error generating reports:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      generateWeeklyReports();
    }
  }, [user]);

  useEffect(() => {
    if (weeklyReports.length > 0 && weeklyReports[0].weekOverview) {
      // important component that took so much time
      setWeekSummary(weeklyReports[0].weekOverview);
    }
  }, [weeklyReports]);

  const [weekSummary, setWeekSummary] = useState({
    totalEntries: 0,
    avgWordsPerEntry: 0,
    moodTrend: "neutral",
    accomplishedTasks: 0,
    pendingTasks: 0,
  });

  // Mock weekly analysis
  const weeklyAnalysis = {
    summary:
      "This week showed a positive trend in your mood, with a notable increase in productive activities and creative pursuits. You've been more consistent with your journaling, which is a great habit to maintain.",
    emotionalPatterns:
      "You expressed more positive emotions this week compared to last week. There was a 20% increase in entries mentioning happiness and contentment. Anxiety levels appear to have decreased based on your language patterns.",
    achievements: [
      "Completed the project presentation",
      "Started regular exercise",
      "Read 2 books",
      "Maintained consistent sleep schedule",
    ],
    improvement:
      "Consider allocating more time for social activities as your entries indicate some feelings of isolation. Also, your stress levels tend to peak on Wednesdays - planning relaxing activities midweek might help balance this.",
    goalProgress:
      "You're making steady progress on your writing goals, with 3 out of 5 planned sessions completed this week. Your meditation practice has been consistent with 6 out of 7 days logged.",
    notable:
      "Your creativity seems to flow better in the mornings based on the timing and content of your entries. Consider scheduling creative tasks earlier in the day.",
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#111827] text-foreground dark:text-white">
      <DiaryNav />

      <div className="pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8">
        <h1 className="text-center font-serif font-medium mb-2">AI Reports</h1>
        <p className="text-gray-500 text-center mb-6">
          Insights and patterns from your diary entries
        </p>

        <Tabs defaultValue="weekly">
          <TabsList className="mb-6 flex justify-center mx-auto max-w-md border rounded-md px-4 py-2 shadow-sm">
            <TabsTrigger value="weekly">Weekly Analysis</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
            <TabsTrigger value="insights">Custom Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Week Overview
                  </CardTitle>
                  <CardDescription>
                    {weeklyReports[0]?.dateRange || "This Week"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Entries</span>
                      <span className="font-medium">
                        {weekSummary.totalEntries}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg. Words</span>
                      <span className="font-medium">
                        {weekSummary.avgWordsPerEntry}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mood Trend</span>
                      <span className="font-medium text-green-600">
                        ↗ {weekSummary.moodTrend}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks Completed</span>
                      <span className="font-medium text-green-600">
                        {weekSummary.accomplishedTasks}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks Pending</span>
                      <span className="font-medium text-yellow-600">
                        {weekSummary.pendingTasks}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    Mood Graph
                  </CardTitle>
                  <CardDescription>7-day emotional pattern</CardDescription>
                </CardHeader>
                <CardContent className="h-64 px-2 pt-4">
                  {weeklyReports[0]?.moodByDate?.length > 0 ? (
                    <LiveMoodLineChart data={weeklyReports[0].moodByDate} />
                  ) : (
                    <div className="text-center text-sm text-gray-400 mt-12">
                      Mood graph visualization will appear here
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>
                  AI-generated analysis based on your entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{weeklyAnalysis.summary}</p>

                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-blue-100 p-1 rounded-md mr-2">
                    <LineChartIcon size={18} className="text-blue-600" />
                  </span>
                  Emotional Patterns
                </h3>
                <p className="mb-4 pl-8">{weeklyAnalysis.emotionalPatterns}</p>

                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-green-100 p-1 rounded-md mr-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                  </span>
                  Achievements
                </h3>
                <ul className="mb-4 pl-8">
                  {weeklyAnalysis.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start mb-1">
                      <span className="text-green-500 mr-2">✓</span>
                      {achievement}
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-yellow-100 p-1 rounded-md mr-2">
                    <XCircle size={18} className="text-yellow-600" />
                  </span>
                  Areas for Improvement
                </h3>
                <p className="mb-4 pl-8">{weeklyAnalysis.improvement}</p>

                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-purple-100 p-1 rounded-md mr-2">
                    <BarChart2 size={18} className="text-purple-600" />
                  </span>
                  Goal Progression
                </h3>
                <p className="mb-4 pl-8">{weeklyAnalysis.goalProgress}</p>

                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-red-100 p-1 rounded-md mr-2">
                    <PieChart size={18} className="text-red-600" />
                  </span>
                  Notable Insights
                </h3>
                <p className="pl-8">{weeklyAnalysis.notable}</p>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-serif font-medium mb-4">
              Previous Weeks
            </h2>
            <div className="space-y-4 ">
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow-sm animate-pulse p-4"
                    >
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {weeklyReports.map((report) => (
                    <Collapsible
                      key={report.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 dark:bg-[#111827]"
                    >
                      <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
                        <div className="text-left">
                          <h3 className="text-lg font-medium">
                            {report.dateRange}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {report.daysWithEntries.length} entries
                          </p>
                        </div>
                        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                      </CollapsibleTrigger>

                      <CollapsibleContent className="p-4 pt-0 border-t border-gray-100">
                        {/* Writing Days */}
                        <div className="mb-4">
                          <h4 className="font-medium mb-2">Writing Days</h4>
                          <div className="flex items-center space-x-1">
                            {eachDayOfInterval({
                              start: report.startDate,
                              end: report.endDate,
                            }).map((day, i) => {
                              const dayOfMonth = day.getDate();
                              const hasEntry =
                                report.daysWithEntries.includes(dayOfMonth);
                              return (
                                <div
                                  key={i}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                    hasEntry
                                      ? "bg-diary-purple text-white"
                                      : "bg-gray-100 text-gray-500"
                                  }`}
                                >
                                  {dayOfMonth}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Summary */}
                        <div>
                          <h4 className="font-medium mb-2">Summary</h4>
                          <p className="text-gray-600">{report.summary}</p>
                        </div>

                        {/* ✅ Mood Chart for current week only */}
                        {report.id === 1 && report.moodByDate && (
                          <div className="mt-6">
                            <h4 className="font-medium mb-2">Mood Trend</h4>
                            <LiveMoodLineChart data={report.moodByDate} />
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <CalendarDays
                  size={48}
                  className="mx-auto mb-4 text-diary-purple opacity-50"
                />
                <h3 className="text-xl font-medium mb-2">
                  Monthly Analysis Coming Soon
                </h3>
                <p className="text-gray-500">
                  Continue writing in your diary to unlock monthly trend
                  analysis
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <LineChartIcon
                  size={48}
                  className="mx-auto mb-4 text-diary-purple opacity-50"
                />
                <h3 className="text-xl font-medium mb-2">
                  Custom Insights Coming Soon
                </h3>
                <p className="text-gray-500">
                  This feature will allow you to get AI insights about specific
                  topics in your diary
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;


import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, XCircle, LineChart, PieChart, BarChart2, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Reports = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Mock data for demo purposes
  const weekSummary = {
    totalEntries: 5,
    avgWordsPerEntry: 320,
    moodTrend: "positive",
    accomplishedTasks: 12,
    pendingTasks: 4,
  };

  // Mock weekly analysis
  const weeklyAnalysis = {
    summary: "This week showed a positive trend in your mood, with a notable increase in productive activities and creative pursuits. You've been more consistent with your journaling, which is a great habit to maintain.",
    emotionalPatterns: "You expressed more positive emotions this week compared to last week. There was a 20% increase in entries mentioning happiness and contentment. Anxiety levels appear to have decreased based on your language patterns.",
    achievements: ["Completed the project presentation", "Started regular exercise", "Read 2 books", "Maintained consistent sleep schedule"],
    improvement: "Consider allocating more time for social activities as your entries indicate some feelings of isolation. Also, your stress levels tend to peak on Wednesdays - planning relaxing activities midweek might help balance this.",
    goalProgress: "You're making steady progress on your writing goals, with 3 out of 5 planned sessions completed this week. Your meditation practice has been consistent with 6 out of 7 days logged.",
    notable: "Your creativity seems to flow better in the mornings based on the timing and content of your entries. Consider scheduling creative tasks earlier in the day.",
  };

  // Mock weekly reports
  const weeklyReports = [
    { 
      id: 1, 
      dateRange: "April 8 - April 14, 2025", 
      daysWithEntries: [9, 10, 12, 14],
      summary: "A productive week with consistent journaling. Your mood trended positive, with peaks of happiness on Wednesday and Friday."
    },
    { 
      id: 2, 
      dateRange: "April 1 - April 7, 2025", 
      daysWithEntries: [1, 3, 4, 5, 7],
      summary: "You wrote consistently this week! Your entries showed a good balance between work and personal reflections."
    },
    { 
      id: 3, 
      dateRange: "March 25 - March 31, 2025", 
      daysWithEntries: [25, 27, 31],
      summary: "Less entries this week, but deeper reflections. Your writing showed more introspection and goal-setting."
    },
    { 
      id: 4, 
      dateRange: "March 18 - March 24, 2025", 
      daysWithEntries: [20, 21, 24],
      summary: "A week focused on creative endeavors. Your entries mentioned several new ideas and projects you're excited about."
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <DiaryNav />
      
      <div className="pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8">
        <h1 className="text-3xl font-serif font-medium mb-2">AI Reports</h1>
        <p className="text-gray-500 mb-6">Insights and patterns from your diary entries</p>
        
        <Tabs defaultValue="weekly">
          <TabsList className="mb-6">
            <TabsTrigger value="weekly">Weekly Analysis</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Trends</TabsTrigger>
            <TabsTrigger value="insights">Custom Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Week Overview</CardTitle>
                  <CardDescription>April 8 - April 14, 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Entries</span>
                      <span className="font-medium">{weekSummary.totalEntries}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Avg. Words</span>
                      <span className="font-medium">{weekSummary.avgWordsPerEntry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Mood Trend</span>
                      <span className="font-medium text-green-600">↗ {weekSummary.moodTrend}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks Completed</span>
                      <span className="font-medium text-green-600">{weekSummary.accomplishedTasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tasks Pending</span>
                      <span className="font-medium text-yellow-600">{weekSummary.pendingTasks}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Mood Graph</CardTitle>
                  <CardDescription>7-day emotional pattern</CardDescription>
                </CardHeader>
                <CardContent className="h-48 flex items-center justify-center">
                  <LineChart className="w-full h-full text-diary-purple opacity-50" />
                  <div className="absolute text-sm text-gray-400">Mood graph visualization will appear here</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>AI-generated analysis based on your entries</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{weeklyAnalysis.summary}</p>
                
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <span className="bg-blue-100 p-1 rounded-md mr-2">
                    <LineChart size={18} className="text-blue-600" />
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
            
            <h2 className="text-2xl font-serif font-medium mb-4">Previous Weeks</h2>
            <div className="space-y-4">
              {weeklyReports.map((report) => (
                <Collapsible key={report.id} className="bg-white rounded-lg shadow-sm border border-gray-100">
                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-lg font-medium">{report.dateRange}</h3>
                      <p className="text-sm text-gray-500">{report.daysWithEntries.length} entries</p>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0 border-t border-gray-100">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Writing Days</h4>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const day = i + (report.id === 1 ? 8 : (report.id === 2 ? 1 : (report.id === 3 ? 25 : 18)));
                          const hasEntry = report.daysWithEntries.includes(day);
                          return (
                            <div
                              key={i}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                                hasEntry ? "bg-diary-purple text-white" : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-gray-600">{report.summary}</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="monthly">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <CalendarDays size={48} className="mx-auto mb-4 text-diary-purple opacity-50" />
                <h3 className="text-xl font-medium mb-2">Monthly Analysis Coming Soon</h3>
                <p className="text-gray-500">
                  Continue writing in your diary to unlock monthly trend analysis
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="insights">
            <Card className="flex items-center justify-center h-64">
              <div className="text-center">
                <LineChart size={48} className="mx-auto mb-4 text-diary-purple opacity-50" />
                <h3 className="text-xl font-medium mb-2">Custom Insights Coming Soon</h3>
                <p className="text-gray-500">
                  This feature will allow you to get AI insights about specific topics in your diary
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

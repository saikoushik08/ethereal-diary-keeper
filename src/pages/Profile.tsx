
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookText, Calendar, BarChart2 } from "lucide-react";

const Profile = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Calculate stats (mock data for demo)
  const stats = {
    totalEntries: 47,
    daysActive: 32,
    longestStreak: 12,
    currentStreak: 5,
    wordsWritten: 15720,
    tagsUsed: 24,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DiaryNav />
      
      <div className="pl-64 pt-8 pr-8 pb-8">
        <h1 className="text-3xl font-serif font-medium mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center">
                    <Avatar className="w-32 h-32 mb-4">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.username || "User"}`} alt={profile?.username} />
                      <AvatarFallback>{profile?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm">
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" defaultValue={profile?.username} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email} />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" placeholder="Tell us about yourself" className="resize-none" rows={4} />
                    </div>
                    
                    <Button>Save Changes</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Journal Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-diary-lavender rounded-lg flex items-center">
                    <BookText className="text-diary-purple mr-3" size={24} />
                    <div>
                      <div className="text-2xl font-bold">{stats.totalEntries}</div>
                      <div className="text-sm text-gray-600">Total Entries</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-diary-blue rounded-lg flex items-center">
                    <Calendar className="text-blue-600 mr-3" size={24} />
                    <div>
                      <div className="text-2xl font-bold">{stats.daysActive}</div>
                      <div className="text-sm text-gray-600">Days Active</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-100 rounded-lg flex items-center">
                    <BarChart2 className="text-green-600 mr-3" size={24} />
                    <div>
                      <div className="text-2xl font-bold">{stats.currentStreak}</div>
                      <div className="text-sm text-gray-600">Day Streak</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-white border rounded-lg">
                    <div className="text-2xl font-bold">{stats.wordsWritten.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Words Written</div>
                  </div>
                  
                  <div className="p-4 bg-white border rounded-lg">
                    <div className="text-2xl font-bold">{stats.longestStreak}</div>
                    <div className="text-sm text-gray-600">Longest Streak</div>
                  </div>
                  
                  <div className="p-4 bg-white border rounded-lg">
                    <div className="text-2xl font-bold">{stats.tagsUsed}</div>
                    <div className="text-sm text-gray-600">Tags Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Journal Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="default-view">Default View</Label>
                  <select 
                    id="default-view" 
                    className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-diary-purple focus:border-diary-purple"
                  >
                    <option value="daily">Daily View</option>
                    <option value="calendar">Calendar View</option>
                    <option value="timeline">Timeline View</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input id="reminder-time" type="time" defaultValue="20:00" />
                </div>
                
                <div>
                  <Label>Favorite Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button variant="outline" size="sm" className="bg-diary-lavender border-none">
                      #gratitude
                    </Button>
                    <Button variant="outline" size="sm" className="bg-diary-blue border-none">
                      #work
                    </Button>
                    <Button variant="outline" size="sm" className="bg-green-100 border-none">
                      #health
                    </Button>
                    <Button variant="outline" size="sm">
                      + Add Tag
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Writing Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg p-4 text-center space-y-2">
                  <div className="text-4xl font-bold text-diary-purple">{stats.currentStreak}</div>
                  <div className="text-gray-600">Day Streak</div>
                  <p className="text-sm text-gray-500 pt-2">
                    You've been writing consistently for {stats.currentStreak} days.
                    Keep it up to reach your best streak of {stats.longestStreak} days!
                  </p>
                </div>
                <div className="grid grid-cols-7 gap-1 mt-4">
                  {Array.from({ length: 21 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-6 rounded-sm ${
                        i < stats.currentStreak % 21 
                          ? "bg-diary-purple" 
                          : "bg-gray-200"
                      }`}
                    ></div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 mt-1 flex justify-between">
                  <span>Last 3 weeks</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

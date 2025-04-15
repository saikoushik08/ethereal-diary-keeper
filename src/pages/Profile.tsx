
import { useState, useEffect, useRef } from "react";
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookText, Calendar, BarChart2, Camera, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const { toast } = useToast();

  // File input reference
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  // Calculate stats (mock data for demo)
  const stats = {
    totalEntries: 47,
    daysActive: 32,
    longestStreak: 12,
    currentStreak: 5,
    wordsWritten: 15720,
    tagsUsed: 24,
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      if (!user) throw new Error("User not authenticated");

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: data.publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated."
      });
      
      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your avatar.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Avatar image must be less than 2MB.",
          variant: "destructive"
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement('video');
      const canvasElement = document.createElement('canvas');
      
      videoElement.srcObject = stream;
      videoElement.play();
      
      setTimeout(() => {
        const context = canvasElement.getContext('2d');
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
        
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        canvasElement.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            uploadAvatar(file);
          }
        }, 'image/jpeg');
      }, 1000);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved."
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem saving your profile.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DiaryNav />
      
      <div className="pl-24 md:pl-24 lg:pl-64 pt-8 pr-8 pb-8">
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
                      <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${username || "User"}`} alt={username} />
                      <AvatarFallback>{username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" onClick={() => setShowAvatarModal(true)}>
                      Change Avatar
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username" 
                          value={username} 
                          onChange={(e) => setUsername(e.target.value)} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={user?.email || ""} readOnly className="bg-gray-50" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell us about yourself" 
                        className="resize-none" 
                        rows={4}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)} 
                      />
                    </div>
                    
                    <Button onClick={saveProfile} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
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

      {/* Avatar Change Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Change Profile Picture</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowAvatarModal(false)}>
                <X size={18} />
              </Button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${username || "User"}`} alt={username} />
                <AvatarFallback>{username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <Upload className="mr-2" size={18} />
                Upload Image
              </Button>
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={takePhoto}
                disabled={uploading}
              >
                <Camera className="mr-2" size={18} />
                Take Photo
              </Button>
              
              <Button
                variant="ghost"
                className="w-full mt-2"
                onClick={() => setShowAvatarModal(false)}
              >
                Cancel
              </Button>
            </div>
            
            {uploading && (
              <div className="mt-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-diary-purple mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Uploading...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;

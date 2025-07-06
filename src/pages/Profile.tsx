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
import { supabase } from "@/lib/supabase/client";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

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

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);

      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated.",
      });

      setShowAvatarModal(false);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your avatar.",
        variant: "destructive",
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
          variant: "destructive",
        });
        return;
      }
      uploadAvatar(file);
    }
  };

  const takePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoElement = document.createElement("video");
      const canvasElement = document.createElement("canvas");

      videoElement.srcObject = stream;
      videoElement.play();

      setTimeout(() => {
        const context = canvasElement.getContext("2d");
        canvasElement.width = videoElement.videoWidth;
        canvasElement.height = videoElement.videoHeight;
        context?.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

        stream.getTracks().forEach((track) => track.stop());

        canvasElement.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
            uploadAvatar(file);
          }
        }, "image/jpeg");
      }, 1000);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({ username, bio })
        .eq("id", user.id);
      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem saving your profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-[#111827] text-foreground dark:text-white">
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
                      <AvatarImage
                        src={
                          avatarUrl ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${username || "User"}`
                        }
                        alt={username}
                      />
                      <AvatarFallback>
                        {username?.substring(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAvatarModal(true)}
                    >
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
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          readOnly
                          className="bg-gray-50 dark:bg-[#111827]"
                        />
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
                  {/* Stats cards */}
                  {[
                    {
                      icon: <BookText className="text-diary-purple mr-3 " size={24} />,
                      label: "Total Entries",
                      value: stats.totalEntries,
                      className: "bg-diary-lavender dark:text-black",
                    },
                    {
                      icon: <Calendar className="text-blue-600 mr-3" size={24} />,
                      label: "Days Active",
                      value: stats.daysActive,
                      className: "bg-diary-blue dark:text-black",
                    },
                    {
                      icon: <BarChart2 className="text-green-600 mr-3" size={24} />,
                      label: "Day Streak",
                      value: stats.currentStreak,
                      className: "bg-green-100 dark:text-black",
                    },
                    {
                      label: "Words Written",
                      value: stats.wordsWritten.toLocaleString(),
                      className: "bg-green-100 dark:text-black",
                    },
                    {
                      label: "Longest Streak",
                      value: stats.longestStreak,
                      className: "bg-green-100 dark:text-black",
                    },
                    {
                      label: "Tags Used",
                      value: stats.tagsUsed,
                      className: "bg-green-100 dark:text-black",
                    },
                  ].map(({ icon, label, value, className }, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg flex items-center ${
                        className || "bg-white border"
                      }`}
                    >
                      {icon}
                      <div>
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="text-sm text-gray-600">{label}</div>
                      </div>
                    </div>
                  ))}
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
                    className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-diary-purple focus:border-diary-purple dark:bg-[#111827]"
                  >
                    <option value="daily">Daily View</option>
                    <option value="calendar">Calendar View</option>
                    <option value="timeline">Timeline View</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="reminder-time">Reminder Time</Label>
                  <Input id="reminder-time" type="time" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {showAvatarModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-80 space-y-4 relative">
              <button
                onClick={() => setShowAvatarModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
              <h2 className="text-lg font-semibold mb-2">Update Avatar</h2>
              <Button
                className="w-full flex items-center gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload from device
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                className="w-full flex items-center gap-2"
                variant="secondary"
                onClick={takePhoto}
              >
                <Camera size={18} />
                Take a photo
              </Button>
              {uploading && <p className="text-sm text-gray-500 text-center">Uploading...</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

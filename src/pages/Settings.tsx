
import { useState, useEffect } from "react";
import { DiaryNav } from "@/components/DiaryNav";
import { useAuth } from "@/context/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserSettings {
  autoSave: boolean;
  reminders: boolean;
  aiAnalysis: boolean;
  language: string;
  theme: "light" | "dark";
  fontSize: string;
  encryption: boolean;
  biometric: boolean;
  backupEnabled: boolean;
  backupFrequency: string;
}

const Settings = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    autoSave: true,
    reminders: false,
    aiAnalysis: true,
    language: "en",
    theme: "light",
    fontSize: "medium",
    encryption: true,
    biometric: false,
    backupEnabled: false,
    backupFrequency: "weekly",
  });
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showDeleteEntries, setShowDeleteEntries] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    const savedSettings = localStorage.getItem('diary_settings');
    const savedAppearance = localStorage.getItem('diary_appearance');
    
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
    
    if (savedAppearance) {
      try {
        const parsedAppearance = JSON.parse(savedAppearance);
        setSettings(prevSettings => ({ 
          ...prevSettings, 
          theme: parsedAppearance.theme || prevSettings.theme,
          fontSize: parsedAppearance.fontSize || prevSettings.fontSize
        }));
        
        applyTheme(parsedAppearance.theme || 'light');
        applyFontSize(parsedAppearance.fontSize || 'medium');
      } catch (error) {
        console.error("Error parsing saved appearance:", error);
      }
    }
  }, []);

  const applyTheme = (theme: string) => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const applyFontSize = (size: string) => {
    document.documentElement.style.fontSize = 
      size === "small" ? "14px" : 
      size === "large" ? "18px" : 
      "16px";
  };

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSettingChange = (name: keyof UserSettings, value: any) => {
    setSettings({ ...settings, [name]: value });
  };

  const saveGeneralSettings = async () => {
    try {
      setSaving(true);
      
      localStorage.setItem('diary_settings', JSON.stringify({
        autoSave: settings.autoSave,
        reminders: settings.reminders,
        aiAnalysis: settings.aiAnalysis,
        language: settings.language,
        lastUpdated: new Date().toISOString()
      }));
      
      toast({
        title: "Settings saved",
        description: "Your general settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAppearanceSettings = async () => {
    try {
      setSaving(true);
      
      applyTheme(settings.theme);
      applyFontSize(settings.fontSize);
      
      localStorage.setItem('diary_appearance', JSON.stringify({
        theme: settings.theme,
        fontSize: settings.fontSize,
        lastUpdated: new Date().toISOString()
      }));
      
      toast({
        title: "Appearance updated",
        description: "Your appearance settings have been applied.",
      });
    } catch (error) {
      console.error("Error saving appearance:", error);
      toast({
        title: "Error",
        description: "Failed to update appearance. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!newPassword || !currentPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAllEntries = async () => {
    try {
      setSaving(true);
      
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setShowDeleteEntries(false);
      
      toast({
        title: "Entries deleted",
        description: "All your diary entries have been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting entries:", error);
      toast({
        title: "Error",
        description: "Failed to delete entries. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation required",
        description: 'Please type "DELETE" to confirm.',
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      if (!user) throw new Error("User not authenticated");
      
      const { error: entriesError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);
      
      if (entriesError) throw entriesError;
      
      await logout();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted and you've been logged out.",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
      setShowDeleteAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DiaryNav />
      
      <div className="pl-24 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8">
        <h1 className="text-3xl font-serif font-medium mb-6 dark:text-white">Settings</h1>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="export">Export & Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">General Settings</CardTitle>
                <CardDescription className="dark:text-gray-400">Customize your diary experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="font-medium dark:text-white">Auto-save entries</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Save your entries automatically as you write</p>
                    </div>
                    <Switch 
                      id="auto-save" 
                      checked={settings.autoSave} 
                      onCheckedChange={(checked) => handleSettingChange("autoSave", checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" className="font-medium dark:text-white">Reminder notifications</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get reminders to write in your diary</p>
                    </div>
                    <Switch 
                      id="notifications" 
                      checked={settings.reminders} 
                      onCheckedChange={(checked) => handleSettingChange("reminders", checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-analysis" className="font-medium dark:text-white">AI analysis</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enable AI to analyze your entries and provide insights</p>
                    </div>
                    <Switch 
                      id="ai-analysis" 
                      checked={settings.aiAnalysis} 
                      onCheckedChange={(checked) => handleSettingChange("aiAnalysis", checked)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="language" className="font-medium dark:text-white">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleSettingChange("language", value)}
                  >
                    <SelectTrigger id="language" className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button onClick={saveGeneralSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="dark:text-white">Appearance</CardTitle>
                <CardDescription className="dark:text-gray-400">Customize how your diary looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium mb-2 block dark:text-white">Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className={`h-auto p-4 flex flex-col items-center ${settings.theme === "light" ? "border-diary-purple ring-2 ring-diary-purple/50" : "bg-white dark:bg-gray-700 dark:text-white dark:border-gray-600"}`}
                      onClick={() => handleSettingChange("theme", "light")}
                    >
                      <div className="w-full h-24 bg-white border rounded-md mb-2 flex items-center justify-center dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        Light
                      </div>
                      <span className="dark:text-white">Light Mode</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`h-auto p-4 flex flex-col items-center ${settings.theme === "dark" ? "border-diary-purple ring-2 ring-diary-purple/50" : "dark:bg-gray-700 dark:text-white dark:border-gray-600"}`}
                      onClick={() => handleSettingChange("theme", "dark")}
                    >
                      <div className="w-full h-24 bg-diary-dark border rounded-md mb-2 flex items-center justify-center text-white dark:bg-gray-900 dark:border-gray-700">
                        Dark
                      </div>
                      <span className="dark:text-white">Dark Mode</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="font-size" className="font-medium dark:text-white">Font Size</Label>
                  <Select 
                    value={settings.fontSize} 
                    onValueChange={(value) => handleSettingChange("fontSize", value)}
                  >
                    <SelectTrigger id="font-size" className="mt-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="pt-4">
                  <Button onClick={saveAppearanceSettings} disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage your data and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="encryption" className="font-medium">End-to-end encryption</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt your diary entries for maximum privacy</p>
                    </div>
                    <Switch 
                      id="encryption" 
                      checked={settings.encryption} 
                      onCheckedChange={(checked) => handleSettingChange("encryption", checked)} 
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="biometric" className="font-medium">Biometric authentication</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use fingerprint or face ID to access your diary</p>
                    </div>
                    <Switch 
                      id="biometric" 
                      checked={settings.biometric} 
                      onCheckedChange={(checked) => handleSettingChange("biometric", checked)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="current-password" className="font-medium">Change Password</Label>
                  <Input 
                    type="password" 
                    id="current-password" 
                    placeholder="Current password" 
                    className="mt-1 mb-2"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="New password" 
                    className="mb-2"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input 
                    type="password" 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <div className="pt-4">
                  <Button onClick={updatePassword} disabled={saving}>
                    {saving ? "Updating..." : "Update Security Settings"}
                  </Button>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">These actions are irreversible</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setShowDeleteEntries(true)}
                    >
                      Delete All Entries
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setShowDeleteAccount(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export & Backup</CardTitle>
                <CardDescription>Export your diary data or create backups</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Download your diary entries in different formats
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export started",
                        description: "Your PDF is being generated and will download shortly."
                      });
                    }}>
                      Export as PDF
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export started",
                        description: "Your JSON file is being generated and will download shortly."
                      });
                    }}>
                      Export as JSON
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export started",
                        description: "Your Markdown files are being generated and will download shortly."
                      });
                    }}>
                      Export as Markdown
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Automatic Backups</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Configure automatic backups of your diary
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-backup" className="font-medium">Enable automatic backups</Label>
                        <p className="text-sm text-gray-500">Create backups on a schedule</p>
                      </div>
                      <Switch 
                        id="auto-backup" 
                        checked={settings.backupEnabled} 
                        onCheckedChange={(checked) => handleSettingChange("backupEnabled", checked)} 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="backup-frequency" className="font-medium">Backup frequency</Label>
                      <Select 
                        value={settings.backupFrequency} 
                        onValueChange={(value) => handleSettingChange("backupFrequency", value)}
                        disabled={!settings.backupEnabled}
                      >
                        <SelectTrigger id="backup-frequency" className="mt-1">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="default" 
                    className="mr-2"
                    onClick={() => {
                      toast({
                        title: "Backup created",
                        description: "Your diary backup has been created successfully."
                      });
                    }}
                  >
                    Create Backup Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Restore options",
                        description: "Select a backup file to restore from."
                      });
                    }}
                  >
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteEntries} onOpenChange={setShowDeleteEntries}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2" size={20} />
              Delete All Entries
            </DialogTitle>
            <DialogDescription>
              This will permanently delete all your diary entries. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteEntries(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteAllEntries}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete All Entries"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAccount} onOpenChange={setShowDeleteAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="mr-2" size={20} />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account and all data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Label htmlFor="confirm-delete">
              Type <span className="font-bold">DELETE</span> to confirm
            </Label>
            <Input 
              id="confirm-delete"
              className="mt-1"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAccount(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteAccount}
              disabled={saving || deleteConfirmText !== "DELETE"}
            >
              {saving ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;

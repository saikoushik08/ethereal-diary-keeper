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
import { supabase } from "@/lib/supabase/client";
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
    theme: "light", // Default theme, will be overridden by localStorage if present
    fontSize: "medium", // Default font size
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

  // Effect for loading initial settings from localStorage
  useEffect(() => {
    const savedGeneral = localStorage.getItem('diary_settings');
    const savedAppearance = localStorage.getItem('diary_appearance');
    
    let newSettingsState = { ...settings }; // Start with component's initial state

    if (savedGeneral) {
      try {
        const parsedGeneral = JSON.parse(savedGeneral);
        if (typeof parsedGeneral.autoSave === 'boolean') newSettingsState.autoSave = parsedGeneral.autoSave;
        if (typeof parsedGeneral.reminders === 'boolean') newSettingsState.reminders = parsedGeneral.reminders;
        if (typeof parsedGeneral.aiAnalysis === 'boolean') newSettingsState.aiAnalysis = parsedGeneral.aiAnalysis;
        if (typeof parsedGeneral.language === 'string') newSettingsState.language = parsedGeneral.language;
      } catch (error) {
        console.error("Error parsing saved general settings:", error);
      }
    }
    
    if (savedAppearance) {
      try {
        const parsedAppearance = JSON.parse(savedAppearance);
        if (parsedAppearance.theme === "light" || parsedAppearance.theme === "dark") {
          newSettingsState.theme = parsedAppearance.theme;
        }
        if (["small", "medium", "large"].includes(parsedAppearance.fontSize)) {
          newSettingsState.fontSize = parsedAppearance.fontSize;
        }
      } catch (error) {
        console.error("Error parsing saved appearance settings:", error);
      }
    }
    setSettings(newSettingsState);
    // The setSettings call above will trigger the effect below to apply theme/font to DOM.
  }, []); // Empty dependency array: runs only on mount

  // Effect for applying theme and font size changes to the DOM
  useEffect(() => {
    // Apply theme
    if (settings.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Apply font size
    document.documentElement.style.fontSize = 
      settings.fontSize === "small" ? "14px" : 
      settings.fontSize === "large" ? "18px" : 
      "16px";
      
  }, [settings.theme, settings.fontSize]); // Runs when theme or fontSize in state changes

  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSettingChange = (name: keyof UserSettings, value: any) => {
    setSettings(prevSettings => ({ ...prevSettings, [name]: value }));
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
      
      // Visual application (theme/font size) is handled by the useEffect hook.
      // This function now primarily persists the settings to localStorage.
      localStorage.setItem('diary_appearance', JSON.stringify({
        theme: settings.theme,
        fontSize: settings.fontSize,
        lastUpdated: new Date().toISOString()
      }));
      
      toast({
        title: "Appearance updated",
        description: "Your appearance settings have been applied and saved.",
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
        description: "Please fill in current and new password fields.",
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
      // Note: Supabase's updateUser doesn't directly verify currentPassword on the client.
      // Secure password change often involves re-authentication or a dedicated endpoint.
      // This call updates the password for the currently authenticated user.
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        // Provide more specific feedback if possible
        if (error.message.includes("New password should be different from the old password")) {
           toast({ title: "Update Failed", description: error.message, variant: "destructive"});
        } else if (error.message.includes("Password should be at least")) {
           toast({ title: "Password Too Short", description: error.message, variant: "destructive"});
        } else {
          throw error;
        }
        return; 
      }
      
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error Updating Password",
        description: error.message || "Failed to update password. Please try again.",
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
    } catch (error: any) {
      console.error("Error deleting entries:", error);
      toast({
        title: "Error Deleting Entries",
        description: error.message || "Failed to delete entries. Please try again.",
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
      
      // Step 1: Delete user-specific data (e.g., entries)
      const { error: entriesError } = await supabase
        .from('entries')
        .delete()
        .eq('user_id', user.id);
      
      if (entriesError) throw entriesError;
      
      // Step 2: Attempt to delete the auth user.
      // IMPORTANT: Deleting an auth user from client-side is highly restricted in Supabase
      // by default for security. This typically requires a Supabase Edge Function (RPC call)
      // with service_role privileges. The `logout()` below will clear the local session.
      // Consider this a "soft delete" from client perspective if full auth user deletion isn't set up.
      // const { error: userDeleteError } = await supabase.rpc('delete_current_user'); // Example RPC call
      // if (userDeleteError) throw userDeleteError;


      await logout(); // Clears local session, AuthContext should handle redirect.
      
      toast({
        title: "Account Data Cleared",
        description: "Your entries have been deleted, and you've been logged out. Full account deletion may require server-side processing.",
      });
      // No need to setShowDeleteAccount(false) as user should be redirected by logout.
      // Reset text in case the dialog doesn't unmount immediately.
      setDeleteConfirmText("");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error Deleting Account",
        description: error.message || "Failed to delete account data. Please try again.",
        variant: "destructive"
      });
      // Don't hide dialog on error, allow user to cancel or retry (if applicable).
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <DiaryNav />
      
      <div className="pl-20 md:pl-24 lg:pl-64 pt-8 pr-4 md:pr-8 pb-8 transition-all duration-300 ease-in-out">
        <h1 className="text-3xl font-serif font-medium mb-6 text-gray-800 dark:text-gray-200">Settings</h1>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="export">Export & Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Customize your diary experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="font-medium">Auto-save entries</Label>
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
                      <Label htmlFor="notifications" className="font-medium">Reminder notifications</Label>
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
                      <Label htmlFor="ai-analysis" className="font-medium">AI analysis</Label>
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
                  <Label htmlFor="language" className="font-medium">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => handleSettingChange("language", value)}
                  >
                    <SelectTrigger id="language" className="mt-1">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
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
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how your diary looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="font-medium mb-2 block">Theme</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className={`h-auto p-4 flex flex-col items-center transition-colors duration-150 ${settings.theme === "light" ? "border-diary-purple ring-2 ring-diary-purple/50" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      onClick={() => handleSettingChange("theme", "light")}
                    >
                      <div className="w-full h-24 bg-white border rounded-md mb-2 flex items-center justify-center text-gray-800">
                        Light
                      </div>
                      <span>Light Mode</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className={`h-auto p-4 flex flex-col items-center transition-colors duration-150 ${settings.theme === "dark" ? "border-diary-purple ring-2 ring-diary-purple/50" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                      onClick={() => handleSettingChange("theme", "dark")}
                    >
                      <div className="w-full h-24 bg-diary-dark border border-gray-300 dark:border-gray-700 rounded-md mb-2 flex items-center justify-center text-white">
                        Dark
                      </div>
                      <span>Dark Mode</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="font-size" className="font-medium">Font Size</Label>
                  <Select 
                    value={settings.fontSize} 
                    onValueChange={(value) => handleSettingChange("fontSize", value)}
                  >
                    <SelectTrigger id="font-size" className="mt-1">
                      <SelectValue placeholder="Select font size" />
                    </SelectTrigger>
                    <SelectContent>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt your diary entries for maximum privacy (conceptual)</p>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">Use fingerprint or face ID (conceptual, platform dependent)</p>
                    </div>
                    <Switch 
                      id="biometric" 
                      checked={settings.biometric} 
                      onCheckedChange={(checked) => handleSettingChange("biometric", checked)} 
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="current-password">Change Password</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Enter your current password to set a new one.</p>
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
                    {saving ? "Updating..." : "Update Password"}
                  </Button>
                </div>
                
                <div className="pt-6 border-t dark:border-gray-700">
                  <h3 className="text-lg font-medium text-red-600 dark:text-red-500 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">These actions are irreversible.</p>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                      onClick={() => setShowDeleteEntries(true)}
                    >
                      Delete All Entries
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-red-500 text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-900/20 dark:hover:text-red-400"
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Download your diary entries in different formats (conceptual).
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export (Conceptual)",
                        description: "PDF export functionality would be implemented here."
                      });
                    }}>
                      Export as PDF
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export (Conceptual)",
                        description: "JSON export functionality would be implemented here."
                      });
                    }}>
                      Export as JSON
                    </Button>
                    <Button variant="outline" onClick={() => {
                      toast({
                        title: "Export (Conceptual)",
                        description: "Markdown export functionality would be implemented here."
                      });
                    }}>
                      Export as Markdown
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t dark:border-gray-700">
                  <h3 className="text-lg font-medium mb-2">Automatic Backups</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Configure automatic backups of your diary (conceptual).
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-backup" className="font-medium">Enable automatic backups</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Create backups on a schedule</p>
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
                        title: "Backup (Conceptual)",
                        description: "Manual backup creation would be implemented here."
                      });
                    }}
                  >
                    Create Backup Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "Restore (Conceptual)",
                        description: "Restore from backup functionality would be implemented here."
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
            <DialogTitle className="flex items-center text-red-600 dark:text-red-500">
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

      <Dialog open={showDeleteAccount} onOpenChange={(isOpen) => {
        setShowDeleteAccount(isOpen);
        if (!isOpen) setDeleteConfirmText(""); // Reset on close
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600 dark:text-red-500">
              <AlertTriangle className="mr-2" size={20} />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This will permanently delete your account data (like entries) and log you out. This action cannot be undone. 
              Please type "<span className="font-bold text-red-600 dark:text-red-500">DELETE</span>" to confirm.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            <Label htmlFor="confirm-delete" className="sr-only">
              Type DELETE to confirm
            </Label>
            <Input 
              id="confirm-delete"
              className="mt-1"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDeleteAccount(false); setDeleteConfirmText("");}}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={deleteAccount}
              disabled={saving || deleteConfirmText !== "DELETE"}
            >
              {saving ? "Deleting..." : "Delete Account Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
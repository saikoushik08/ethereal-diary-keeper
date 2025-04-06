
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

const Settings = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DiaryNav />
      
      <div className="pl-64 pt-8 pr-8 pb-8">
        <h1 className="text-3xl font-serif font-medium mb-6">Settings</h1>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="export">Export & Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Customize your diary experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auto-save" className="font-medium">Auto-save entries</Label>
                      <p className="text-sm text-gray-500">Save your entries automatically as you write</p>
                    </div>
                    <Switch id="auto-save" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="notifications" className="font-medium">Reminder notifications</Label>
                      <p className="text-sm text-gray-500">Get reminders to write in your diary</p>
                    </div>
                    <Switch id="notifications" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ai-analysis" className="font-medium">AI analysis</Label>
                      <p className="text-sm text-gray-500">Enable AI to analyze your entries and provide insights</p>
                    </div>
                    <Switch id="ai-analysis" defaultChecked />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="language" className="font-medium">Language</Label>
                  <Select defaultValue="en">
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
                  <Button>Save Changes</Button>
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
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center bg-white">
                      <div className="w-full h-24 bg-white border rounded-md mb-2 flex items-center justify-center">
                        Light
                      </div>
                      <span>Light Mode</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center">
                      <div className="w-full h-24 bg-diary-dark border rounded-md mb-2 flex items-center justify-center text-white">
                        Dark
                      </div>
                      <span>Dark Mode</span>
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="font-size" className="font-medium">Font Size</Label>
                  <Select defaultValue="medium">
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
                  <Button>Save Changes</Button>
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
                      <p className="text-sm text-gray-500">Encrypt your diary entries for maximum privacy</p>
                    </div>
                    <Switch id="encryption" defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="biometric" className="font-medium">Biometric authentication</Label>
                      <p className="text-sm text-gray-500">Use fingerprint or face ID to access your diary</p>
                    </div>
                    <Switch id="biometric" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="current-password" className="font-medium">Change Password</Label>
                  <Input type="password" id="current-password" placeholder="Current password" className="mt-1 mb-2" />
                  <Input type="password" placeholder="New password" className="mb-2" />
                  <Input type="password" placeholder="Confirm new password" />
                </div>
                
                <div className="pt-4">
                  <Button>Update Security Settings</Button>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">These actions are irreversible</p>
                  <div className="space-y-2">
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                      Delete All Entries
                    </Button>
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
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
                    <Button variant="outline">
                      Export as PDF
                    </Button>
                    <Button variant="outline">
                      Export as JSON
                    </Button>
                    <Button variant="outline">
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
                      <Switch id="auto-backup" />
                    </div>
                    
                    <div>
                      <Label htmlFor="backup-frequency" className="font-medium">Backup frequency</Label>
                      <Select defaultValue="weekly">
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
                  <Button variant="default" className="mr-2">
                    Create Backup Now
                  </Button>
                  <Button variant="outline">
                    Restore from Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

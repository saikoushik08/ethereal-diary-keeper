
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LandingHero } from "@/components/LandingHero";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import { AboutSection } from "@/components/AboutSection";
import { FeatureSection } from "@/components/FeatureSection";
import { ContactSection } from "@/components/ContactSection";
import { useTheme } from "@/context/ThemeContext";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState<string>("login");

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen flex flex-col">
        <LandingHero />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <CardContent className="pt-6">
                <Tabs defaultValue={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="py-4">
                    <LoginForm />
                  </TabsContent>
                  <TabsContent value="signup" className="py-4">
                    <SignupForm />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <FeatureSection />
        <AboutSection />
        <ContactSection />
      </div>
    </div>
  );
};

export default Index;

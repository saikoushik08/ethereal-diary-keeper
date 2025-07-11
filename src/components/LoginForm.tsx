import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Github, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "Login failed");
      toast({
        title: "Login error",
        description: error.message || "Login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: `Login with ${provider} failed`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 bg-[#001a3a] text-white p-6 rounded-lg">
      {error && (
        <div className="bg-red-900/20 p-3 rounded-md flex items-start text-sm text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-black text-white border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-black text-white border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-diary-purple hover:bg-diary-purple/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Logging in...
          </span>
        ) : (
          "Log In"
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-px bg-gray-300 w-1/3" />
        <span className="text-sm text-gray-500">or</span>
        <div className="h-px bg-gray-300 w-1/3" />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 bg-[#020817] text-white"
        >
          <Mail className="w-5 h-5" />
          Continue with Google
        </Button>
        <Button
          type="button"
          onClick={() => handleOAuthLogin("github")}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 bg-[#020817] text-white"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </Button>
      </div>
    </form>
  );
};
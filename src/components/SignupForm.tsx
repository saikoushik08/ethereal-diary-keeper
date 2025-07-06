import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Eye, EyeOff, Github } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { supabase } from "@/lib/supabase/client";

export const SignupForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { toast } = useToast();
  const navigate = useNavigate();

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const getPasswordStrength = () => {
    if (password.length < 6) return "Weak";
    if (password.length < 10) return "Moderate";
    return "Strong";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created!",
        description: "Check your email to confirm your account.",
      });

      navigate("/dashboard");
    } catch (error: any) {
      setError(error.message || "There was an error creating your account.");
      toast({
        title: "Sign up failed",
        description: error.message || "There was an error creating your account.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithProvider = async (provider: "google" | "github") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + "/dashboard",
      },
    });

    if (error) {
      toast({
        title: `Sign in with ${provider} failed`,
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-[#001a3a] text-white p-6 rounded-lg">
      {error && (
        <div className="bg-red-900/20 p-3 rounded-md flex items-start text-sm text-red-300">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="username" className="text-white">Username</Label>
        <Input
          id="username"
          placeholder="johndoe"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="bg-white text-black border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-white text-black border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="password" className="text-white">Password</Label>
        <Input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-white text-black border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
        <button
          type="button"
          onClick={togglePassword}
          className="absolute right-3 top-[38px] text-gray-500"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        <p className="text-xs text-red-600 mt-1">Password Strength: {getPasswordStrength()}</p>
      </div>

      <div className="space-y-2 relative">
        <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="bg-white text-black border border-gray-300 focus:ring-2 focus:ring-diary-purple rounded-lg px-4 py-2"
        />
        <button
          type="button"
          onClick={toggleConfirmPassword}
          className="absolute right-3 top-[38px] text-gray-500"
        >
          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full bg-diary-purple hover:bg-diary-purple/90 text-white"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </Button>

      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-px bg-gray-300 w-1/3" />
        <span className="text-sm text-gray-500">or</span>
        <div className="h-px bg-gray-300 w-1/3" />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          onClick={() => signInWithProvider("google")}
          variant="outline"
         className="w-full flex items-center justify-center gap-2 bg-[#020817] text-white"
        >
          <FaGoogle className="w-5 h-5" />
          Continue with Google
        </Button>

        <Button
          type="button"
          onClick={() => signInWithProvider("github")}
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

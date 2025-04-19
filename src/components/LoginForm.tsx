import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import { FaSpinner } from "react-icons/fa";  // Import spinner icon

// Email validation regex
const validateEmail = (email: string) => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

// Error alert component
const ErrorAlert = ({ message }: { message: string }) => (
  <div className="bg-red-50 p-3 rounded-md flex items-start text-sm">
    <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
    <span className="text-red-800">{message}</span>
  </div>
);

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back to your diary!",
      });
      navigate("/dashboard");
    } catch (error: any) {
      if (error.message.includes("invalid_email")) {
        setError("The email address is not registered.");
      } else if (error.message.includes("incorrect_password")) {
        setError("The password you entered is incorrect.");
      } else {
        setError(error.message || "Failed to log in. Please check your credentials.");
      }
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}  {/* Use the ErrorAlert component */}
      <div className="space-y-2 text-black">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2 text-black">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-diary-purple hover:bg-diary-purple/90"
        disabled={isLoading}
      >
        {isLoading ? (
          <FaSpinner className="animate-spin h-5 w-5 mr-2" />
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
};

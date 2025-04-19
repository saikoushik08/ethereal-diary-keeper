import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import { FaSpinner, FaEye, FaEyeSlash } from "react-icons/fa"; // Eye icons for password visibility toggle

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // For toggling password visibility
  const [emailValid, setEmailValid] = useState(true); // Email validation state
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Check email validity
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailValid(validateEmail(emailValue)); // Validate email on the fly
  };

  // Password strength indicator logic
  const checkPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    return strength;
  };

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
      {error && <ErrorAlert message={error} />} {/* Use the ErrorAlert component */}

      {/* Email Field */}
      <div className="space-y-2 text-black">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={handleEmailChange}
          required
          className={!emailValid ? 'border-red-500' : ''}
        />
        {!emailValid && <p className="text-red-500">Invalid email format.</p>}
      </div>

      {/* Password Field */}
      <div className="space-y-2 text-black">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((prev) => !prev)}
            className="absolute top-1/2 right-3 transform -translate-y-1/2"
          >
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      {/* Password Strength Indicator */}
      <div className="text-sm">
        <p className={`text-red-500`}>Password Strength: {checkPasswordStrength(password)} / 3</p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-diary-purple hover:bg-diary-purple/90"
        disabled={isLoading || !emailValid || password.length < 8}
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

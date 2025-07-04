import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronDown } from "lucide-react";

interface LandingHeroProps {
  onScrollDown: () => void;
}

export const LandingHero = ({ onScrollDown }: LandingHeroProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative">
      {/* Title */}
      <div className="absolute z-10 top-32 md:top-32 left-4 md:left-8 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
        <span className="text-diary-purple">Ethereal</span>
        <span className="text-white">Diary</span>
      </div>

      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center px-4 md:px-6">
        <div
          className={`w-full md:w-full transform transition-all duration-700 ${
            showAuth ? "opacity-0 -translate-x-20" : "opacity-100"
          } text-center md:text-left`}
        >
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif font-bold mb-4 md:mb-6">
            Your digital sanctuary
          </h1>
          <p className="text-base md:text-lg text-gray-300 mb-6 md:mb-8 px-6 md:px-0">
            Capture your thoughts, track your journey, and gain insights with AI-powered analysis.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
            <Button
              aria-label="Try It Now"
              className="bg-diary-purple hover:bg-diary-purple/90 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-full transition-all duration-300"
              onClick={() => setShowAuth(true)}
            >
              Try It
            </Button>
            <Button
              aria-label="Get Started"
              className="bg-diary-purple hover:bg-diary-purple/90 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-full transition-all duration-300"
              onClick={onScrollDown}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Forms */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
          showAuth ? "opacity-100 z-20" : "opacity-0 pointer-events-none -z-10"
        }`}
      >
        <div className="bg-[#001a3a] backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl w-[90%] max-w-sm md:max-w-md animate-fade-in">
          <div className="flex justify-between mb-6 md:mb-8">
            <button
              className={`text-base md:text-lg font-medium pb-2 px-2 md:px-4 ${
                showLogin
                  ? "text-diary-purple border-b-2 border-diary-purple"
                  : "text-gray-400"
              }`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button
              className={`text-base md:text-lg font-medium pb-2 px-2 md:px-4 ${
                !showLogin
                  ? "text-diary-purple border-b-2 border-diary-purple"
                  : "text-gray-400"
              }`}
              onClick={() => setShowLogin(false)}
            >
              Sign Up
            </button>
          </div>

          {/* Conditional Rendering of Login and Signup Forms */}
          {showLogin ? <LoginForm /> : <SignupForm />}

          <Button variant="outline" className="  mt-4 w-full text-black" onClick={() => setShowAuth(false)}>
            Back to Home
          </Button>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-white/10 hover:bg-white/20"
          onClick={onScrollDown}
        >
          <ChevronDown className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default LandingHero;

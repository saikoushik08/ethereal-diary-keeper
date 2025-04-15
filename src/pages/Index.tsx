
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";
import LandingHero from "@/components/LandingHero";
import FeatureSection from "@/components/FeatureSection";
import AboutSection from "@/components/AboutSection";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const featuresRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen text-white"
      style={{
        backgroundImage: `url("/final-back.png")`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: "#1c1c1c",
      }}
    >
      {/* Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1c1c1c]/80 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center py-4 px-4 md:px-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">Ethereal</span>
            <span className="text-2xl font-bold text-diary-purple">Diary</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Button variant="ghost" onClick={() => scrollToSection(featuresRef)}>Features</Button>
            <Button variant="ghost" onClick={() => scrollToSection(aboutRef)}>About</Button>
            <Button variant="ghost" onClick={() => scrollToSection(contactRef)}>Contact</Button>
          </nav>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="md:hidden">
              <Menu size={20} />
            </Button>
            <Button
              onClick={() => setShowAuth(true)}
              className="bg-diary-purple text-white hover:bg-diary-purple/90 group"
            >
              Try It
              <ChevronRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-20">
        {/* Hero Section */}
        <div ref={heroRef} className="min-h-screen">
          <LandingHero onScrollDown={() => scrollToSection(featuresRef)} />
        </div>
        
        {/* Features Section */}
        <div ref={featuresRef} className="min-h-screen py-20">
          <FeatureSection />
        </div>
        
        {/* About Section */}
        <div ref={aboutRef} className="min-h-screen py-20">
          <AboutSection />
        </div>
        
        {/* Contact Section */}
        <div ref={contactRef} className="min-h-screen py-20 flex items-end">
          <footer className="w-full bg-black/80 backdrop-blur-md py-12 px-4">
            <div className="container mx-auto">
              <h2 className="text-3xl font-serif font-bold mb-8 text-center">Contact Us</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="bg-diary-purple/20 p-4 rounded-full mb-4">
                    <Mail className="h-8 w-8 text-diary-purple" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Email</h3>
                  <p className="text-gray-300">support@etherealdiary.com</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-diary-purple/20 p-4 rounded-full mb-4">
                    <Phone className="h-8 w-8 text-diary-purple" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Phone</h3>
                  <p className="text-gray-300">+1 (555) 123-4567</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="bg-diary-purple/20 p-4 rounded-full mb-4">
                    <MapPin className="h-8 w-8 text-diary-purple" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Address</h3>
                  <p className="text-gray-300 text-center">123 Diary Lane, Suite 101<br />San Francisco, CA 94107</p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-6 mt-12">
                <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
                <a href="#" className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
                  <Instagram className="h-6 w-6" />
                </a>
              </div>
              
              <div className="text-center mt-12 text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} Ethereal Diary. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl w-[90%] max-w-sm md:max-w-md animate-fade-in">
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

            {showLogin ? <LoginForm /> : <SignupForm />}

            <Button variant="outline" className="mt-4 w-full text-black" onClick={() => setShowAuth(false)}>
              Back to Home
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;

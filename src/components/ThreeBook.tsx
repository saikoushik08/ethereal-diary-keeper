import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { useIsMobile } from "@/hooks/use-mobile";

// Simple Book component when not using a full GLTF model
function DiaryBook({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const bookRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Adjust camera position based on screen size
    if (isMobile) {
      camera.position.set(0, 0, 6); // Move camera back on mobile for better view
    } else {
      camera.position.set(0, 0, 5);
    }
  }, [camera, isMobile]);
  
  useFrame(() => {
    if (bookRef.current) {
      if (open) {
        bookRef.current.rotation.y = THREE.MathUtils.lerp(
          bookRef.current.rotation.y,
          Math.PI,
          0.05
        );
      } else {
        bookRef.current.rotation.y = THREE.MathUtils.lerp(
          bookRef.current.rotation.y,
          0,
          0.05
        );
      }
    }
  });

  // Scale book based on screen size
  const bookScale = isMobile ? 0.8 : 1;

  return (
    <group 
      ref={bookRef} 
      onClick={() => setOpen(!open)}
      position={[0, 0, 0]}
      scale={[bookScale, bookScale, bookScale]}
    >
      {/* Front cover with purple color */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial 
          color="#9b87f5"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.9, 3.9, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back cover */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#D3E4FD" />
      </mesh>
    </group>
  );
}

export const ThreeBook = () => {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const isMobile = useIsMobile();

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="absolute z-10 top-4 md:top-8 left-4 md:left-8 text-3xl md:text-4xl lg:text-5xl font-serif font-bold">
        <span className="text-diary-purple">Dear</span>
        <span className="text-diary-dark">Diary</span>
      </div>
      
      <div className="absolute w-full max-w-4xl flex flex-col md:flex-row items-center px-4 md:px-6">
        <div className={`w-full md:w-1/2 transform transition-all duration-700 ${open ? 'opacity-0 -translate-x-20' : 'opacity-100'} text-center md:text-left`}>
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-serif font-bold mb-4 md:mb-6">
            Your digital sanctuary
          </h1>
          <p className="text-base md:text-lg text-gray-600 mb-6 md:mb-8 px-6 md:px-0">
            Capture your thoughts, track your journey, and gain insights with AI-powered analysis.
          </p>
          <Button 
            className="bg-diary-purple hover:bg-diary-purple/90 text-white px-6 py-4 md:px-8 md:py-6 text-base md:text-lg rounded-full"
            onClick={() => setOpen(true)}
          >
            Get Started
          </Button>
        </div>
        
        {/* 3D Book Canvas */}
        <div className="w-full md:w-1/2 h-[350px] md:h-[500px] book-container mt-8 md:mt-0">
          <Canvas className="w-full h-full" shadows>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />
            <pointLight position={[-10, -10, -10]} />
            <DiaryBook open={open} setOpen={setOpen} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Environment preset="sunset" />
          </Canvas>
        </div>
      </div>
      
      {/* Auth forms that appear when the book is open */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="bg-white/90 backdrop-blur-sm p-4 md:p-8 rounded-2xl shadow-xl w-[90%] max-w-sm md:max-w-md animate-fade-in">
          <div className="flex justify-between mb-6 md:mb-8">
            <button 
              className={`text-base md:text-lg font-medium pb-2 px-2 md:px-4 ${showLogin ? 'text-diary-purple border-b-2 border-diary-purple' : 'text-gray-400'}`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={`text-base md:text-lg font-medium pb-2 px-2 md:px-4 ${!showLogin ? 'text-diary-purple border-b-2 border-diary-purple' : 'text-gray-400'}`}
              onClick={() => setShowLogin(false)}
            >
              Sign Up
            </button>
          </div>
          
          {showLogin ? <LoginForm /> : <SignupForm />}
          
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            onClick={() => setOpen(false)}
          >
            Back to Book
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThreeBook;

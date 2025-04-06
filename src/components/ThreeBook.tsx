
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

// Simple Book component when not using a full GLTF model
function Book({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const bookRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  useEffect(() => {
    camera.position.set(0, 0, 5);
  }, [camera]);
  
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

  return (
    <group 
      ref={bookRef} 
      onClick={() => setOpen(!open)}
      position={[0, 0, 0]}
    >
      {/* Front cover */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#D4AF37" />
      </mesh>

      {/* Pages */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.9, 3.9, 0.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      {/* Back cover */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial color="#1A1A1A" />
      </mesh>
      
      {/* Title text (fake) */}
      <mesh position={[0, 0, 0.2]}>
        <planeGeometry args={[2, 1]} />
        <meshBasicMaterial 
          transparent
          opacity={0.9}
          color="#1A1A1A" 
        />
      </mesh>
    </group>
  );
}

export const ThreeBook = () => {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="absolute z-10 top-8 left-8 text-4xl md:text-5xl font-serif font-bold">
        <span className="text-diary-gold">Dear</span>
        <span className="text-white">Diary</span>
      </div>
      
      <div className="absolute w-full max-w-4xl flex flex-col md:flex-row items-center px-6">
        <div className={`w-full md:w-1/2 transform transition-all duration-700 ${open ? 'opacity-0 -translate-x-20' : 'opacity-100'}`}>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-white">
            Your digital sanctuary
          </h1>
          <p className="text-lg text-gray-400 mb-8">
            Capture your thoughts, track your journey, and gain insights with AI-powered analysis.
          </p>
          <Button 
            className="bg-diary-gold hover:bg-diary-gold/90 text-diary-black px-8 py-6 text-lg rounded-full"
            onClick={() => setOpen(true)}
          >
            Get Started
          </Button>
        </div>
        
        {/* 3D Book Canvas */}
        <div className="w-full md:w-1/2 h-[500px] book-container">
          <Canvas className="w-full h-full" shadows>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} />
            <Book open={open} setOpen={setOpen} />
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 1.5}
            />
            <Environment preset="night" />
          </Canvas>
        </div>
      </div>
      
      {/* Auth forms that appear when the book is open */}
      <div 
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="bg-diary-dark/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in border border-diary-gold/20">
          <div className="flex justify-between mb-8">
            <button 
              className={`text-lg font-medium pb-2 px-4 ${showLogin ? 'text-diary-gold border-b-2 border-diary-gold' : 'text-gray-400'}`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={`text-lg font-medium pb-2 px-4 ${!showLogin ? 'text-diary-gold border-b-2 border-diary-gold' : 'text-gray-400'}`}
              onClick={() => setShowLogin(false)}
            >
              Sign Up
            </button>
          </div>
          
          {showLogin ? <LoginForm /> : <SignupForm />}
          
          <Button 
            variant="outline" 
            className="mt-4 w-full border-diary-gold/50 text-diary-gold hover:bg-diary-gold/10"
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

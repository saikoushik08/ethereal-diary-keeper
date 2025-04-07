import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, useTexture } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

// Simple Book component when not using a full GLTF model
function DiaryBook({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const bookRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  
  // Load the diary cover texture
  const coverTexture = useTexture("/diary-cover.jpg");
  
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
      {/* Front cover with image texture */}
      <mesh position={[0, 0, 0.1]}>
        <boxGeometry args={[3, 4, 0.2]} />
        <meshStandardMaterial 
          map={coverTexture} 
          bumpScale={0.05}
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
      
      {/* Ribbon bookmark */}
      <mesh position={[0, -1.8, 0.4]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.1, 1, 0.01]} />
        <meshStandardMaterial color="#ff5555" />
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
        <span className="text-diary-purple">Dear</span>
        <span className="text-diary-dark">Diary</span>
      </div>
      
      <div className="absolute w-full max-w-4xl flex flex-col md:flex-row items-center px-6">
        <div className={`w-full md:w-1/2 transform transition-all duration-700 ${open ? 'opacity-0 -translate-x-20' : 'opacity-100'}`}>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6">
            Your digital sanctuary
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Capture your thoughts, track your journey, and gain insights with AI-powered analysis.
          </p>
          <Button 
            className="bg-diary-purple hover:bg-diary-purple/90 text-white px-8 py-6 text-lg rounded-full"
            onClick={() => setOpen(true)}
          >
            Get Started
          </Button>
        </div>
        
        {/* 3D Book Canvas */}
        <div className="w-full md:w-1/2 h-[500px] book-container">
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
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md animate-fade-in">
          <div className="flex justify-between mb-8">
            <button 
              className={`text-lg font-medium pb-2 px-4 ${showLogin ? 'text-diary-purple border-b-2 border-diary-purple' : 'text-gray-400'}`}
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>
            <button 
              className={`text-lg font-medium pb-2 px-4 ${!showLogin ? 'text-diary-purple border-b-2 border-diary-purple' : 'text-gray-400'}`}
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

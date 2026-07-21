import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, OrbitControls, Float, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ZoomIn, ZoomOut, RefreshCcw, Info, Palette } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const CUP_COLORS = [
  { name: 'Espresso Black', value: '#161210' },
  { name: 'Cream White', value: '#fefae0' },
  { name: 'Latte Caramel', value: '#d4a373' },
  { name: 'Roast Brown', value: '#382e29' },
];

function PlaceholderCup({ color }: { color: string }) {
  const meshRef = useRef<THREE.Group>(null);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const handleMaterialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  useEffect(() => {
    // GSAP elastic scale entrance animation
    if (meshRef.current) {
      meshRef.current.scale.set(0, 0, 0);
      gsap.to(meshRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)',
        delay: 0.2
      });
    }
  }, []);

  useEffect(() => {
    // Smooth transition for color change
    if (materialRef.current && handleMaterialRef.current) {
      gsap.to(materialRef.current.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 0.5
      });
      gsap.to(handleMaterialRef.current.color, {
        r: new THREE.Color(color).r,
        g: new THREE.Color(color).g,
        b: new THREE.Color(color).b,
        duration: 0.5
      });
    }
  }, [color]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.5, 1, 3, 32]} />
          <meshPhysicalMaterial 
            ref={materialRef}
            color={color} 
            roughness={0.15} 
            metalness={0.6}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Handle */}
        <mesh position={[1.5, 0, 0]} castShadow>
          <torusGeometry args={[0.8, 0.2, 16, 32, Math.PI]} />
          <meshPhysicalMaterial 
            ref={handleMaterialRef}
            color={color} 
            roughness={0.15} 
            metalness={0.6}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>

        {/* Hotspots */}
        <Html position={[0, 1.5, 1.5]} center zIndexRange={[100, 0]}>
          <div className="relative" onMouseEnter={() => setActiveHotspot(1)} onMouseLeave={() => setActiveHotspot(null)}>
            <button 
              className="w-8 h-8 rounded-full bg-amber-500/80 backdrop-blur-sm border-2 border-cream-50 flex items-center justify-center text-cream-50 hover:scale-110 transition-transform cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-48 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 text-sm text-cream-50 shadow-xl pointer-events-none transition-all duration-300 ${activeHotspot === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h4 className="font-bold text-amber-500 mb-1">Premium Roast</h4>
              <p className="text-slate-300 text-xs">Rich, dark, and perfectly balanced. 100% Arabica.</p>
            </div>
          </div>
        </Html>

        <Html position={[-1.2, -0.5, 1]} center zIndexRange={[100, 0]}>
          <div className="relative" onMouseEnter={() => setActiveHotspot(2)} onMouseLeave={() => setActiveHotspot(null)}>
            <button 
              className="w-8 h-8 rounded-full bg-amber-500/80 backdrop-blur-sm border-2 border-cream-50 flex items-center justify-center text-cream-50 hover:scale-110 transition-transform cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            >
              <Info className="w-4 h-4" />
            </button>
            <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-48 p-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 text-sm text-cream-50 shadow-xl pointer-events-none transition-all duration-300 ${activeHotspot === 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
              <h4 className="font-bold text-amber-500 mb-1">Sustainable Ceramic</h4>
              <p className="text-slate-300 text-xs">Handcrafted locally to retain heat while remaining cool to the touch.</p>
            </div>
          </div>
        </Html>
      </Float>
    </group>
  );
}

function GsapCameraRig() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Initial setup
    camera.position.set(0, 2, 8);
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.5,
      }
    });

    // Animate camera position based on scroll progress
    tl.to(camera.position, {
      x: 5,
      y: 1,
      z: 6,
      ease: 'power2.inOut'
    }, 0).to(camera.position, {
      x: -4,
      y: 3,
      z: 5,
      ease: 'power2.inOut'
    }, 0.5).to(camera.position, {
      x: 0,
      y: 4,
      z: 10,
      ease: 'power2.inOut'
    }, 1);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow keyboard navigation through the 3D scene (scrolls window to move timeline)
      if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
      } else if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
        e.preventDefault();
        window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      tl.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [camera]);

  return null;
}

function ControlsOverlay({ orbitRef, cupColor, setCupColor }: { orbitRef: any, cupColor: string, setCupColor: (c: string) => void }) {
  const handleZoomIn = () => {
    if (orbitRef.current) {
      orbitRef.current.object.position.multiplyScalar(0.8);
      orbitRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (orbitRef.current) {
      orbitRef.current.object.position.multiplyScalar(1.2);
      orbitRef.current.update();
    }
  };

  const handleReset = () => {
    if (orbitRef.current) {
      gsap.to(orbitRef.current.object.position, {
        x: 0, y: 2, z: 8, duration: 1, ease: 'power2.out'
      });
      gsap.to(orbitRef.current.target, {
        x: 0, y: 0, z: 0, duration: 1, ease: 'power2.out'
      });
    }
  };

  return (
    <div className="absolute bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-auto hidden md:flex">
      {/* Color Swatches */}
      <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><Palette className="w-3 h-3" /> Material</div>
        <div className="flex gap-2">
          {CUP_COLORS.map(c => (
            <button
              key={c.value}
              onClick={() => setCupColor(c.value)}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${cupColor === c.value ? 'border-amber-500 scale-110 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'border-slate-500/50'}`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-700 shadow-xl flex flex-col gap-2">
        <button onClick={handleZoomIn} className="p-3 text-slate-300 hover:text-amber-500 hover:bg-slate-800 rounded-xl transition-colors" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={handleReset} className="p-3 text-slate-300 hover:text-amber-500 hover:bg-slate-800 rounded-xl transition-colors" title="Reset View">
          <RefreshCcw className="w-5 h-5" />
        </button>
        <button onClick={handleZoomOut} className="p-3 text-slate-300 hover:text-amber-500 hover:bg-slate-800 rounded-xl transition-colors" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export function ThreeCanvas() {
  const orbitRef = useRef<any>(null);
  const [cupColor, setCupColor] = useState(CUP_COLORS[0].value);

  return (
    <div className="absolute inset-0 w-full h-full z-0">
      <Canvas
        shadows
        camera={{ position: [0, 2, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="pointer-events-auto"
      >
        <Suspense fallback={null}>
          <GsapCameraRig />
          
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.5} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <spotLight position={[-5, 5, -5]} intensity={1} color="#f59e0b" />
          
          <Environment preset="city" />
          
          <PlaceholderCup color={cupColor} />
          
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
            far={4} 
            color="#000000" 
          />
          
          <OrbitControls 
            ref={orbitRef}
            enableZoom={true} 
            enablePan={false}
            autoRotate={false}
            maxPolarAngle={Math.PI / 2 + 0.1}
            minPolarAngle={Math.PI / 3}
            makeDefault
          />
        </Suspense>
      </Canvas>
      <ControlsOverlay orbitRef={orbitRef} cupColor={cupColor} setCupColor={setCupColor} />
    </div>
  );
}

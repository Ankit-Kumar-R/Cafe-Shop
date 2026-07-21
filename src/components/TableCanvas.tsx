import React, { Suspense, useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

function TableMesh({ position, id, onSelect, selected }: { position: [number, number, number], id: number, onSelect: (id: number) => void, selected: boolean }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);
  
  // Smoothly animate emissive color on hover
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(0, 0, 0);
      gsap.to(meshRef.current.scale, {
        x: 1, y: 1, z: 1,
        duration: 1.2,
        ease: 'elastic.out(1, 0.4)',
        delay: id * 0.1 // Stagger based on ID
      });
    }
  }, [id]);
  
  useFrame((state, delta) => {
    if (materialRef.current) {
      const targetEmissive = hovered || selected ? new THREE.Color(0xf59e0b) : new THREE.Color(0x000000);
      const targetIntensity = hovered || selected ? (selected ? 0.8 : 0.5) : 0;
      materialRef.current.emissive.lerp(targetEmissive, 0.1);
      materialRef.current.emissiveIntensity = THREE.MathUtils.lerp(materialRef.current.emissiveIntensity, targetIntensity, 0.1);
    }
  });

  return (
    <group 
      position={position} 
      ref={meshRef}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
    >
      <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
        <meshPhysicalMaterial 
          ref={materialRef}
          color={selected ? "#f59e0b" : "#1e1e1e"}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
      {/* Table Leg */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.5, 16]} />
        <meshPhysicalMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Table Base */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 16]} />
        <meshPhysicalMaterial color="#333333" roughness={0.5} metalness={0.5} />
      </mesh>
    </group>
  );
}

export function TableCanvas({ onTableSelect }: { onTableSelect: (id: number) => void }) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const handleSelect = (id: number) => {
    setSelectedTable(id);
    onTableSelect(id);
  };

  return (
    <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/50 mb-8 relative">
      <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium text-cream-50 border border-slate-700">
        Interactive Floor Plan: Select your preferred table
      </div>
      <Canvas
        shadows
        camera={{ position: [0, 5, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.5} 
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          
          <Environment preset="city" />
          
          {/* Render Tables */}
          <TableMesh position={[-2, 0, -2]} id={1} onSelect={handleSelect} selected={selectedTable === 1} />
          <TableMesh position={[2, 0, -2]} id={2} onSelect={handleSelect} selected={selectedTable === 2} />
          <TableMesh position={[-3, 0, 1.5]} id={3} onSelect={handleSelect} selected={selectedTable === 3} />
          <TableMesh position={[0, 0, 2]} id={4} onSelect={handleSelect} selected={selectedTable === 4} />
          <TableMesh position={[3, 0, 1.5]} id={5} onSelect={handleSelect} selected={selectedTable === 5} />
          
          <ContactShadows 
            position={[0, 0, 0]} 
            opacity={0.4} 
            scale={20} 
            blur={2} 
            far={4} 
            color="#000000" 
          />
          
          <OrbitControls 
            enableZoom={true} 
            enablePan={false}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
            minDistance={4}
            maxDistance={12}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

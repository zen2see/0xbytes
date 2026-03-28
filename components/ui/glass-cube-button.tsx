"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  MeshTransmissionMaterial, 
  Text3D,
  Float, 
  Center,
  Environment
} from "@react-three/drei";
import * as THREE from "three";
import { useRouter } from "next/navigation";

// Define GlassLetter at the top level to ensure it's in scope for GlassWord
function GlassLetter({ char, index, isHovered, position }: { char: string, index: number, isHovered: boolean, position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const fontUrl = "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json";
  
  useFrame((state) => {
    if (meshRef.current) {
      const speed = 2;
      const offset = index * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * speed + offset) * (isHovered ? 0.4 : 0.1);
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * speed * 0.5 + offset) * (isHovered ? 0.2 : 0.05);
      
      const targetScale = isHovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }

    if (materialRef.current) {
      const pulseSpeed = isHovered ? 8 : 4;
      const pulse = Math.sin(state.clock.elapsedTime * pulseSpeed) * 0.2 + 0.3;
      materialRef.current.emissiveIntensity = pulse;
    }
  });

  return (
    <group position={position}>
      <Text3D
        ref={meshRef}
        font={fontUrl}
        size={0.52} // Size set to 0.52
        height={0.18}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.06}
        bevelSize={0.02}
        bevelOffset={0}
        bevelSegments={5}
      >
        {char}
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={16}
          thickness={0.6}
          chromaticAberration={0.3}
          anisotropy={0.5}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.8}
          attenuationColor="#a8a29e" // stone-400
          color="#ffffff"
          roughness={0.05}
          transmission={1}
          ior={1.6}
          // @ts-ignore
          emissive="#78716c" // stone-500
          emissiveIntensity={0.2}
        />
      </Text3D>
    </group>
  );
}

function GlassWord({ text, isHovered }: { text: string, isHovered: boolean }) {
  // Kerning map adjusted for size 0.52
  const charWidths: Record<string, number> = {
    'E': 0.50, 'n': 0.42, 'c': 0.39, 'o': 0.42, 'd': 0.42, 'i': 0.18, 'g': 0.42,
    ' ': 0.30, 'D': 0.50, 'e': 0.42, 'm': 0.62
  };

  const positions = useMemo(() => {
    let currentX = 0;
    const pos: number[] = [];
    const chars = text.split("");
    
    for (let i = 0; i < chars.length; i++) {
      pos.push(currentX);
      currentX += charWidths[chars[i]] || 0.42;
    }

    const totalWidth = currentX;
    return pos.map(p => p - totalWidth / 2);
  }, [text]);

  return (
    <group>
      {text.split("").map((char, i) => (
        <GlassLetter 
          key={i} 
          char={char} 
          index={i} 
          isHovered={isHovered} 
          position={[positions[i], 0, 0]} 
        />
      ))}
    </group>
  );
}

export function Glass3DButton({ href }: { href: string }) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();

  return (
    <div 
      className="relative w-[360px] h-28 cursor-pointer"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={() => router.push(href)}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#ffffff" />
        <spotLight position={[-10, 5, 5]} angle={0.2} penumbra={1} intensity={5} color="#a8a29e" />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <Center>
            <GlassWord text="Encoding Demo" isHovered={hovered} />
          </Center>
        </Float>
      </Canvas>
      
      <a href={href} className="absolute inset-0 z-10 opacity-0">
        Encoding Demo
      </a>
    </div>
  );
}

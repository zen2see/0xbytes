"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { 
  MeshTransmissionMaterial, 
  Text3D,
  Center,
  Environment,
  Float
} from "@react-three/drei";
import * as THREE from "three";

function GlassText({ text, size = 0.65 }: { text: string, size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const fontUrl = "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json";

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <Center>
      <Text3D
        ref={meshRef}
        font={fontUrl}
        size={size}
        height={0.25} // Deeper for more 3D impact
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.06} // Thicker bevel for better light catching
        bevelSize={0.04}
        bevelOffset={0}
        bevelSegments={10}
      >
        {text}
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.8} // Much thicker for more refraction
          chromaticAberration={0.3} // High dispersion for rainbows at edges
          anisotropy={0.5}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationDistance={0.8}
          attenuationColor="#0284c7" // sky-600
          color="#ffffff"
          roughness={0.05} // Smoother surface for sharper highlights
          transmission={1}
          ior={1.6} // Higher index of refraction for more "glassy" look
          // @ts-ignore
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </Text3D>
    </Center>
  );
}

export function Glass3DTitle() {
  return (
    <div className="w-[320px] h-28">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        style={{ background: 'transparent' }}
        shadows
      >
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#ffffff" />
        <spotLight position={[-10, 5, 5]} angle={0.2} penumbra={1} intensity={5} color="#38bdf8" />
        <pointLight position={[0, 0, 2]} intensity={5} color="#ffffff" />
        <Environment preset="city" />
        
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <GlassText text="Byte Converter" size={0.65} />
        </Float>
      </Canvas>
    </div>
  );
}

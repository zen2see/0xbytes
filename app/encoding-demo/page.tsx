"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  encodeBase58,
  decodeBase58,
  encodeBase58Check,
  decodeBase58Check,
  encodeEip55,
  rlpEncode,
  rlpDecode,
} from "../../lib/encoding";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Cube, Sparkle } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import React, { useRef, useMemo } from "react"; // Import useMemo
import { Canvas, useFrame } from "@react-three/fiber"; // Import Canvas and useFrame
import { 
  MeshTransmissionMaterial, 
  Text3D,
  Center,
  Environment,
  Float
} from "@react-three/drei";
import * as THREE from "three";

// Reusable 3D Glass Text component (defined outside the page for correct scope)
function Glass3DTitleText({ text, size = 0.65 }: { text: string, size?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const fontUrl = "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json";

  useFrame((state) => { // useFrame hook is now correctly within a component that will be inside Canvas
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
        height={0.25}
        curveSegments={12}
        bevelEnabled
        bevelThickness={0.06}
        bevelSize={0.04}
        bevelOffset={0}
        bevelSegments={10}
      >
        {text}
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.8}
          chromaticAberration={0.3}
          anisotropy={0.5}
          distortion={0.2}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          clearcoatRoughness={0.05}
          attenuationDistance={0.8}
          attenuationColor="#0284c7" // sky-600
          color="#ffffff"
          roughness={0.05}
          transmission={1}
          ior={1.6}
          // @ts-ignore
          emissive="#0ea5e9"
          emissiveIntensity={0.2}
        />
      </Text3D>
    </Center>
  );
}


export default function EncodingDemoPage() {
  // Base58 State
  const [base58Input, setBase58Input] = useState("Hello World");
  const [encodedBase58, setEncodedBase58] = useState("");
  const [decodedBase58, setDecodedBase58] = useState("");
  const [base58Error, setBase58Error] = useState("");

  // Base58Check State
  const [base58CheckInput, setBase58CheckInput] = useState("Hello Base58Check");
  const [encodedBase58Check, setEncodedBase58Check] = useState("");
  const [decodedBase58Check, setDecodedBase58Check] = useState("");
  const [base58CheckError, setBase58CheckError] = useState("");

  // EIP-55 State
  const [eip55Input, setEip55Input] = useState(
    "0x5aaeb6053f3e94c9b9a09f33669435e7ef1bea8d"
  );
  const [encodedEip55, setEncodedEip55] = useState("");
  const [eip55Error, setEip55Error] = useState("");

  // RLP State
  const [rlpInput, setRlpInput] = useState(`["dog", "cat", "cow"]`);
  const [encodedRlp, setEncodedRlp] = useState("");
  const [decodedRlp, setDecodedRlp] = useState("");
  const [rlpError, setRlpError] = useState("");

  const handleEncodeBase58 = () => {
    try {
      setBase58Error("");
      const buffer = new TextEncoder().encode(base58Input);
      setEncodedBase58(encodeBase58(buffer));
    } catch (e: any) {
      setBase58Error(e.message);
      setEncodedBase58("");
    }
  };

  const handleDecodeBase58 = () => {
    try {
      setBase58Error("");
      const decodedBuffer = decodeBase58(encodedBase58);
      setDecodedBase58(new TextDecoder().decode(decodedBuffer));
    } catch (e: any) {
      setBase58Error(e.message);
      setDecodedBase58("");
    }
  };

  const handleEncodeBase58Check = async () => {
    try {
      setBase58CheckError("");
      const buffer = new TextEncoder().encode(base58CheckInput);
      setEncodedBase58Check(await encodeBase58Check(buffer));
    } catch (e: any) {
      setBase58CheckError(e.message);
      setEncodedBase58Check("");
    }
  };

  const handleDecodeBase58Check = async () => {
    try {
      setBase58CheckError("");
      const decodedBuffer = await decodeBase58Check(encodedBase58Check);
      setDecodedBase58Check(new TextDecoder().decode(decodedBuffer));
    } catch (e: any) {
      setBase58CheckError(e.message);
      setDecodedBase58Check("");
    }
  };

  const handleEncodeEip55 = async () => {
    try {
      setEip55Error("");
      setEncodedEip55(await encodeEip55(eip55Input));
    } catch (e: any) {
      setEip55Error(e.message);
      setEncodedEip55("");
    }
  };

  const handleEncodeRlp = () => {
    try {
      setRlpError("");
      const parsedInput = JSON.parse(rlpInput);
      const encoded = rlpEncode(parsedInput);
      setEncodedRlp(
        "0x" + Array.from(encoded).map(b => b.toString(16).padStart(2, "0")).join("")
      );
    } catch (e: any) {
      setRlpError(e.message);
      setEncodedRlp("");
    }
  };

  const handleDecodeRlp = () => {
    try {
      setRlpError("");
      if (!encodedRlp.startsWith("0x")) {
        throw new Error("RLP encoded string must start with 0x");
      }
      const hexString = encodedRlp.substring(2);
      const buffer = new Uint8Array(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      const decoded = rlpDecode(buffer);
      
      const stringify = (obj: any): any => {
        if (obj instanceof Uint8Array) {
          return new TextDecoder().decode(obj);
        }
        if (Array.isArray(obj)) {
          return obj.map(stringify);
        }
        return obj;
      };

      setDecodedRlp(JSON.stringify(stringify(decoded), null, 2));
    } catch (e: any) {
      setRlpError(e.message);
      setDecodedRlp("");
    }
  };

  return (
    <div className="flex flex-full items-center justify-center min-h-screen p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-4xl space-y-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="inline-block group">
            <motion.div 
              className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-sky-100 dark:border-sky-800 shadow-sm hover:shadow-md transition-shadow"
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-6 h-6 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-sky-50 dark:group-hover:bg-sky-900/40 transition-colors">
                <ArrowLeft size={14} className="text-sky-600 dark:text-sky-400" />
              </div>
              <div className="flex items-center gap-2">
                <Image 
                  src="/next.svg" 
                  alt="Next.js Logo" 
                  width={40} 
                  height={10} 
                  className="dark:invert opacity-70 group-hover:opacity-100 transition-opacity"
                />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                  Home
                </span>
              </div>
            </motion.div>
          </Link>
        </motion.div>

        {/* Header */}
        {/* Using Canvas here to wrap the 3D title for correct R3F hook usage */}
        <div className="flex items-center justify-center"> {/* Centering the header content */}
          <Canvas 
            camera={{ position: [0, 0, 5], fov: 35 }} 
            shadows 
            style={{ height: '150px', width: '100%' }} // Adjust canvas size as needed
          >
            <ambientLight intensity={1.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={10} color="#ffffff" />
            <spotLight position={[-10, 5, 5]} angle={0.2} penumbra={1} intensity={5} color="#0284c7" /> {/* sky-600 for title color */}
            <Environment preset="city" />
            
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
              <Center>
                {/* Text3D component using matching style */}
                <Text3D 
                  font={ "https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json"}
                  size={0.65} // Match Byte Converter title size
                  height={0.25}
                  curveSegments={12}
                  bevelEnabled
                  bevelThickness={0.06}
                  bevelSize={0.04}
                  bevelOffset={0}
                  bevelSegments={10}
                >
                  Encoding Demo
                  <MeshTransmissionMaterial
                    backside
                    samples={16}
                    thickness={0.8}
                    chromaticAberration={0.3}
                    anisotropy={0.5}
                    distortion={0.2}
                    distortionScale={0.2}
                    temporalDistortion={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.05}
                    attenuationDistance={0.8}
                    attenuationColor="#0284c7" // sky-600
                    color="#ffffff"
                    roughness={0.05}
                    transmission={1}
                    ior={1.6}
                    // @ts-ignore
                    emissive="#0ea5e9" // sky-500
                    emissiveIntensity={0.2}
                  />
                </Text3D>
              </Center>
            </Float>
          </Canvas>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Explore various encoding and hashing algorithms used in blockchain technology.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Base58 Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-sky-200/60 dark:border-sky-800 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 mb-1">
                  <Sparkle size={20} weight="fill" />
                  <CardTitle>Base58</CardTitle>
                </div>
                <CardDescription>Used in Bitcoin for addresses to avoid visually similar characters.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input String</label>
                  <Input value={base58Input} onChange={(e) => setBase58Input(e.target.value)} />
                  <Button onClick={handleEncodeBase58} className="w-full bg-sky-600 hover:bg-sky-700">Encode</Button>
                </div>
                {encodedBase58 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Encoded</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md break-all font-mono text-xs">
                      {encodedBase58}
                    </div>
                    <Button variant="outline" onClick={handleDecodeBase58} className="w-full">Decode Back</Button>
                  </div>
                )}
                {decodedBase58 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decoded</label>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md font-mono text-xs">
                      {decodedBase58}
                    </div>
                  </div>
                )}
                {base58Error && <p className="text-xs text-rose-500">{base58Error}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* Base58Check Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-sky-200/60 dark:border-sky-800 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 mb-1">
                  <Sparkle size={20} weight="fill" />
                  <CardTitle>Base58Check</CardTitle>
                </div>
                <CardDescription>Base58 with a 4-byte checksum for error detection.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input String</label>
                  <Input value={base58CheckInput} onChange={(e) => setBase58CheckInput(e.target.value)} />
                  <Button onClick={handleEncodeBase58Check} className="w-full bg-sky-600 hover:bg-sky-700">Encode</Button>
                </div>
                {encodedBase58Check && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Encoded</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md break-all font-mono text-xs">
                      {encodedBase58Check}
                    </div>
                    <Button variant="outline" onClick={handleDecodeBase58Check} className="w-full">Decode Back</Button>
                  </div>
                )}
                {decodedBase58Check && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decoded</label>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md font-mono text-xs">
                      {decodedBase58Check}
                    </div>
                  </div>
                )}
                {base58CheckError && <p className="text-xs text-rose-500">{base58CheckError}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* EIP-55 Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border-sky-200/60 dark:border-sky-800 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 mb-1">
                  <Sparkle size={20} weight="fill" />
                  <CardTitle>EIP-55 Checksum</CardTitle>
                </div>
                <CardDescription>Mixed-case checksum for Ethereum addresses.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ethereum Address (lowercase)</label>
                  <Input value={eip55Input} onChange={(e) => setEip55Input(e.target.value)} />
                  <Button onClick={handleEncodeEip55} className="w-full bg-sky-600 hover:bg-sky-700">Checksum</Button>
                </div>
                {encodedEip55 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Checksummed Address</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md break-all font-mono text-xs">
                      {encodedEip55}
                    </div>
                  </div>
                )}
                {eip55Error && <p className="text-xs text-rose-500">{eip55Error}</p>}
              </CardContent>
            </Card>
          </motion.div>

          {/* RLP Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-sky-200/60 dark:border-sky-800 h-full">
              <CardHeader>
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-300 mb-1">
                  <Sparkle size={20} weight="fill" />
                  <CardTitle>RLP Encoding</CardTitle>
                </div>
                <CardDescription>Recursive Length Prefix - Ethereum's primary serialization format.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Input JSON (array of strings)</label>
                  <Textarea value={rlpInput} onChange={(e) => setRlpInput(e.target.value)} rows={3} />
                  <Button onClick={handleEncodeRlp} className="w-full bg-sky-600 hover:bg-sky-700">RLP Encode</Button>
                </div>
                {encodedRlp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Encoded Hex</label>
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-md break-all font-mono text-xs">
                      {encodedRlp}
                    </div>
                    <Button variant="outline" onClick={handleDecodeRlp} className="w-full">RLP Decode Back</Button>
                  </div>
                )}
                {decodedRlp && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Decoded</label>
                    <pre className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-md font-mono text-xs overflow-auto">
                      {decodedRlp}
                    </pre>
                  </div>
                )}
                {rlpError && <p className="text-xs text-rose-500">{rlpError}</p>}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

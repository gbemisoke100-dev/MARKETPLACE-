"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Core() {
  const mesh = useRef<THREE.Mesh>(null);
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.y += delta * 0.16;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.08;
    }
  });
  return <Float speed={1.1} rotationIntensity={0.16} floatIntensity={0.35}>
    <mesh ref={mesh}>
      <icosahedronGeometry args={[1.18, 5]} />
      <meshPhysicalMaterial color="#d9ff67" roughness={0.22} metalness={0.12} clearcoat={1} clearcoatRoughness={0.14} />
    </mesh>
    <mesh rotation={[Math.PI / 2.8, 0.2, -0.25]} scale={[1.62, 1.62, 1.62]}>
      <torusGeometry args={[1, 0.012, 12, 180]} />
      <meshStandardMaterial color="#d9ff67" metalness={0.8} roughness={0.22} />
    </mesh>
    <mesh rotation={[0.8, 0.5, 0.7]} scale={[1.86, 1.86, 1.86]}>
      <torusGeometry args={[1, 0.006, 8, 180]} />
      <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.35} transparent opacity={0.65} />
    </mesh>
  </Float>;
}

export default function HeroScene() {
  return <div className="hero-canvas" aria-label="Abstract 3D marketplace object">
    <Canvas camera={{ position: [0, 0, 4.7], fov: 38 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.25} />
      <directionalLight position={[4, 5, 4]} intensity={2.4} />
      <pointLight position={[-3, -2, 2]} color="#d9ff67" intensity={18} />
      <Core />
      <Environment preset="city" />
      <ContactShadows position={[0, -1.65, 0]} opacity={0.22} scale={5} blur={2.5} />
    </Canvas>
  </div>;
}
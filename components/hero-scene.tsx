"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
function Sculpture(){
 const core=useRef<THREE.Mesh>(null),orbit=useRef<THREE.Group>(null);
 useFrame((state,delta)=>{if(core.current){core.current.rotation.y+=delta*.13;core.current.rotation.x=Math.sin(state.clock.elapsedTime*.24)*.1;}if(orbit.current)orbit.current.rotation.z+=delta*.055;});
 return <group>
  <Float speed={.8} rotationIntensity={.12} floatIntensity={.3}>
   <mesh ref={core}><icosahedronGeometry args={[1.02,5]}/><meshPhysicalMaterial color="#d6dfad" roughness={.12} metalness={.22} clearcoat={1} clearcoatRoughness={.04} iridescence={.65} iridescenceIOR={1.8}/></mesh>
   <mesh scale={1.23}><icosahedronGeometry args={[1,3]}/><meshBasicMaterial color="#f4f0df" wireframe transparent opacity={.22}/></mesh>
  </Float>
  <group ref={orbit}>
   <mesh rotation={[1.18,.35,-.45]} scale={[1.52,1.52,1.52]}><torusGeometry args={[1,.018,16,220]}/><meshStandardMaterial color="#d7e2a7" metalness={.9} roughness={.18}/></mesh>
   <mesh rotation={[.52,1.05,.9]} scale={[1.72,1.72,1.72]}><torusGeometry args={[1,.009,12,220]}/><meshStandardMaterial color="#fff8df" metalness={.72} roughness={.2} transparent opacity={.75}/></mesh>
  </group>
  <Float speed={1.25} floatIntensity={.5}>
   <mesh position={[1.52,.92,.18]} scale={.095}><icosahedronGeometry args={[1,2]}/><meshStandardMaterial color="#e5edc5" metalness={.65} roughness={.2}/></mesh>
   <mesh position={[-1.45,-.76,.45]} scale={.065}><octahedronGeometry args={[1,1]}/><meshStandardMaterial color="#c5a879" metalness={.7} roughness={.2}/></mesh>
  </Float>
 </group>;
}
export default function HeroScene(){return <div className="hero-canvas" aria-label="Abstract floating glass and metal 3D sculpture"><Canvas camera={{position:[0,0,4.8],fov:38}} dpr={[1,1.5]} gl={{alpha:true,antialias:true,powerPreference:"high-performance"}}><ambientLight intensity={.65}/><directionalLight position={[4,5,4]} intensity={2.1} color="#fff7e8"/><pointLight position={[-3,-2,2]} color="#d9e8a9" intensity={22}/><pointLight position={[2,1,-3]} color="#c6a87b" intensity={8}/><Sculpture/><Sparkles count={75} scale={4.6} size={1.5} speed={.18} opacity={.52} color="#e8e8cf"/><Environment preset="studio"/><ContactShadows position={[0,-1.65,0]} opacity={.2} scale={5} blur={2.8}/></Canvas></div>}
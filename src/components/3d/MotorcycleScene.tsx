"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Float, useGLTF } from "@react-three/drei";
import { Suspense } from "react";
import * as THREE from "three";

// Vous pouvez remplacer ce composant de secours par useGLTF
// si vous avez un vrai fichier de modèle 3D de moto
function FallbackMotorcycle() {
  return (
    <group>
      {/* Roue arrière */}
      <mesh position={[-2, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.4, 32]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>
      
      {/* Roue avant */}
      <mesh position={[2.5, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.4, 32]} />
        <meshStandardMaterial color="#111" roughness={0.9} />
      </mesh>

      {/* Cadre central */}
      <mesh position={[0.2, 0.8, 0]}>
        <boxGeometry args={[3, 1, 0.8]} />
        <meshStandardMaterial color="#cc0000" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Réservoir */}
      <mesh position={[0.5, 1.6, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial color="#E60000" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Fourche */}
      <mesh position={[2.2, 1.2, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.1, 0.1, 2.5]} />
        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function MotorcycleModel() {
  try {
    // Si vous téléchargez un modèle de moto gratuit en .glb (par exemple depuis Sketchfab)
    // placez-le dans le dossier "public" et nommez-le "motorcycle.glb".
    // La ligne suivante essaiera de le charger :
    const { scene } = useGLTF("/motorcycle.glb");
    return <primitive object={scene} scale={1.5} />;
  } catch (error) {
    // S'il n'y a pas de fichier, on affiche un objet abstrait générique qui ressemble très vaguement à une moto
    return <FallbackMotorcycle />;
  }
}

export default function MotorcycleScene() {
  return (
    <div className="h-full w-full min-h-[500px] md:min-h-[700px] relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-black to-zinc-900 border border-zinc-800">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black opacity-60"></div>
      
      <div className="absolute top-4 left-4 z-10 text-white/50 text-xs tracking-wider uppercase">
        <p>Aperçu Interactif</p>
        <p className="text-[10px] opacity-60">Glissez pour tourner</p>
      </div>

      <Canvas camera={{ position: [0, 2, 8], fov: 45 }} className="relative z-10">
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <MotorcycleModel />
            </Float>
          </Stage>
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={1} enableZoom={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 4} />
      </Canvas>
    </div>
  );
}

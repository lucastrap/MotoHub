"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMotorcycle } from "@fortawesome/free-solid-svg-icons";
import type { Group } from "three";

useGLTF.preload("/motorcycle.glb");

function MotorcycleModel() {
  const { scene } = useGLTF("/motorcycle.glb");
  const ref = useRef<Group>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} scale={0.05} position={[0, -1.2, 0]} />
    </group>
  );
}

function LoadingCube() {
  const ref = useRef<Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 2;
  });
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="#E5001E" wireframe />
      </mesh>
    </group>
  );
}

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

// Sans ça, une erreur Three.js remonte à la racine et Next.js remplace toute
// la page par « Application error ».
class SceneErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Scène 3D indisponible :", error.message);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function SceneFallback() {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 text-primary flex items-center justify-center">
        <FontAwesomeIcon icon={faMotorcycle} className="h-7 w-7" />
      </div>
      <p className="text-white/40 text-sm max-w-xs leading-relaxed">
        L&apos;aperçu 3D n&apos;est pas disponible sur cet appareil. Toutes les
        fonctionnalités de MotoTrack restent accessibles.
      </p>
    </div>
  );
}

export default function MotorcycleScene() {
  // null = détection en cours
  const [webglReady, setWebglReady] = useState<boolean | null>(null);

  useEffect(() => {
    setWebglReady(isWebGLAvailable());
  }, []);

  return (
    <div className="h-full w-full min-h-[500px] md:min-h-[700px] relative overflow-hidden bg-[#080808]">
      {/* Glow de fond */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-primary/10 rounded-full blur-[80px]" />
      </div>

      <div className="absolute top-4 left-4 z-10 text-white/25 text-xs tracking-wider uppercase select-none">
        <p className="font-display font-bold">Ducati Panigale V4R</p>
        <p className="text-[10px] opacity-60">Glisse pour explorer</p>
      </div>

      {webglReady === false && <SceneFallback />}
      {webglReady === true && (
        <SceneErrorBoundary fallback={<SceneFallback />}>
          <Canvas
            camera={{ position: [2.5, 0.8, 2.5], fov: 65 }}
            className="relative z-10"
            gl={{ antialias: true, alpha: true }}
          >
            <Suspense fallback={<LoadingCube />}>
              <MotorcycleModel />
              <ContactShadows
                position={[0, -1.2, 0]}
                opacity={0.5}
                scale={12}
                blur={2.5}
                far={6}
                color="#000000"
              />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              maxPolarAngle={Math.PI / 2.1}
              minPolarAngle={Math.PI / 5}
              autoRotate={false}
            />
            <ambientLight intensity={1.2} />
            <directionalLight position={[5, 5, 5]} intensity={2.5} color="#ffffff" />
            <directionalLight position={[-5, 5, -5]} intensity={1.5} color="#ffffff" />
            <directionalLight position={[0, 8, 0]} intensity={2.0} color="#ffffff" />
            <directionalLight position={[0, 2, 6]} intensity={1.8} color="#ffe8d0" />
            <pointLight position={[-3, 3, 3]} intensity={1.5} color="#ffffff" />
            <pointLight position={[3, 1, -3]} intensity={0.8} color="#ff2200" />
          </Canvas>
        </SceneErrorBoundary>
      )}
    </div>
  );
}
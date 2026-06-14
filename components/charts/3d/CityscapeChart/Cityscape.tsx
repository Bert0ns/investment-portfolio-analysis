'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { EtfConfig } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';

interface CityscapeProps {
  etfs: EtfConfig[];
  isRotating: boolean;
}

import {
  layoutCityscape,
  PlacedBuilding,
} from '@/components/charts/3d/CityscapeChart/CityscapeLayout';

function AnimatedGround({ width, height }: { width: number; height: number }) {
  const { scaleX, scaleY } = useSpring({
    scaleX: width + 30,
    scaleY: height + 30,
    config: { mass: 1, tension: 100, friction: 20 },
  });

  return (
    <a.mesh position={[0, 0, -0.5]} scale-x={scaleX} scale-y={scaleY} scale-z={1}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color="#09090b" />
    </a.mesh>
  );
}

function AnimatedDistrictPad({
  plane,
}: {
  plane: { x: number; y: number; size: number; color: string; name: string };
}) {
  const { x, y, size } = useSpring({
    x: plane.x,
    y: plane.y,
    size: plane.size,
    config: { mass: 1, tension: 100, friction: 20 },
  });

  return (
    <a.group position-x={x} position-y={y} position-z={0}>
      <a.mesh scale-x={size} scale-y={size} scale-z={1}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={plane.color} opacity={0.12} transparent depthWrite={false} />

        <mesh>
          <boxGeometry args={[1, 1, 0.05]} />
          <meshBasicMaterial color={plane.color} wireframe transparent opacity={0.2} />
        </mesh>
      </a.mesh>

      {/* District Name Label */}
      <a.group position-y={size.to((s) => s / 2 + 0.5)} position-z={0.1}>
        <Html center zIndexRange={[100, 0]} className="pointer-events-none opacity-90">
          <div
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,1)]"
            style={{ color: plane.color }}
          >
            {plane.name}
          </div>
        </Html>
      </a.group>
    </a.group>
  );
}

function HighestBuildingLabel({ b, isHovered }: { b: PlacedBuilding; isHovered: boolean }) {
  const { x, y, depth } = useSpring({
    x: b.x,
    y: b.y,
    depth: b.depth,
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <a.group position-x={x} position-y={y} position-z={depth}>
      <Html center zIndexRange={[100, 0]} className="pointer-events-none">
        <div
          className={`flex flex-col items-center pb-4 transition-all duration-500 cursor-default ${
            isHovered ? 'opacity-100 scale-125' : 'opacity-40 scale-100'
          }`}
        >
          <div className="text-[7px] md:text-[8px] font-medium tracking-widest whitespace-nowrap px-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
            {b.name}
          </div>
          <div className="w-px h-4 bg-linear-to-b from-white/40 to-transparent mt-0.5" />
        </div>
      </Html>
    </a.group>
  );
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

const MAX_BUILDINGS = 5000;

function FastBuildings({
  buildings,
  hoveredBuilding,
  setHoveredBuilding,
}: {
  buildings: PlacedBuilding[];
  hoveredBuilding: PlacedBuilding | null;
  setHoveredBuilding: (b: PlacedBuilding | null) => void;
}) {
  const count = buildings.length;

  const skyRef = useRef<THREE.InstancedMesh>(null);
  const wireRef = useRef<THREE.InstancedMesh>(null);
  const plazaRef = useRef<THREE.InstancedMesh>(null);

  // Preserve animation state across renders and re-ordering
  const animStates = useRef<
    Map<string, { x: number; y: number; size: number; depth: number; emissive: number }>
  >(new Map());

  // Dynamically update the active draw count without remounting the buffers
  React.useLayoutEffect(() => {
    const activeCount = Math.min(count, MAX_BUILDINGS);
    if (skyRef.current) skyRef.current.count = activeCount;
    if (wireRef.current) wireRef.current.count = activeCount;
    if (plazaRef.current) plazaRef.current.count = activeCount;
  }, [count]);

  useFrame((state, delta) => {
    // Framerate-independent lerp factor (similar to a spring)
    const factor = 1 - Math.exp(-15 * delta);
    let needsUpdate = false;

    for (let i = 0; i < Math.min(buildings.length, MAX_BUILDINGS); i++) {
      const b = buildings[i];
      let curr = animStates.current.get(b.name);
      if (!curr) {
        curr = { x: b.x, y: b.y, size: b.size, depth: b.depth, emissive: 0.3 };
        animStates.current.set(b.name, curr);
      }

      const isHovered = hoveredBuilding?.name === b.name;
      const targetEmissive = isHovered ? 3.5 : 0.6;

      curr.x = THREE.MathUtils.lerp(curr.x, b.x, factor);
      curr.y = THREE.MathUtils.lerp(curr.y, b.y, factor);
      curr.size = THREE.MathUtils.lerp(curr.size, b.size, factor);
      curr.depth = THREE.MathUtils.lerp(curr.depth, b.depth, factor);
      curr.emissive = THREE.MathUtils.lerp(curr.emissive, targetEmissive, factor);

      // --- Skyscraper ---
      if (skyRef.current) {
        tempObject.position.set(curr.x, curr.y, curr.depth / 2);
        tempObject.scale.set(curr.size, curr.size, curr.depth);
        tempObject.updateMatrix();
        skyRef.current.setMatrixAt(i, tempObject.matrix);

        // Emissive color tint
        tempColor.set(b.color).multiplyScalar(curr.emissive);
        skyRef.current.setColorAt(i, tempColor);
      }

      // --- Wireframe ---
      if (wireRef.current) {
        tempObject.position.set(curr.x, curr.y, curr.depth / 2);
        tempObject.scale.set(curr.size + 0.01, curr.size + 0.01, curr.depth + 0.01);
        tempObject.updateMatrix();
        wireRef.current.setMatrixAt(i, tempObject.matrix);
        wireRef.current.setColorAt(i, tempColor.set(b.color).multiplyScalar(isHovered ? 5.0 : 0.4));
      }

      // --- Plaza Foundation ---
      if (plazaRef.current) {
        tempObject.position.set(curr.x, curr.y, 0.05);
        tempObject.scale.set(curr.size + 0.3, curr.size + 0.3, 1);
        tempObject.updateMatrix();
        plazaRef.current.setMatrixAt(i, tempObject.matrix);
        plazaRef.current.setColorAt(i, tempColor.set(b.color));
      }

      needsUpdate = true;
    }

    if (needsUpdate) {
      if (skyRef.current) {
        skyRef.current.instanceMatrix.needsUpdate = true;
        if (skyRef.current.instanceColor) skyRef.current.instanceColor.needsUpdate = true;
      }
      if (wireRef.current) {
        wireRef.current.instanceMatrix.needsUpdate = true;
        if (wireRef.current.instanceColor) wireRef.current.instanceColor.needsUpdate = true;
      }
      if (plazaRef.current) {
        plazaRef.current.instanceMatrix.needsUpdate = true;
        if (plazaRef.current.instanceColor) plazaRef.current.instanceColor.needsUpdate = true;
      }
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined && e.instanceId < count) {
      setHoveredBuilding(buildings[e.instanceId]);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredBuilding(null);
  };

  return (
    <group>
      <instancedMesh ref={plazaRef} args={[null as any, null as any, MAX_BUILDINGS]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial opacity={0.08} transparent depthWrite={false} />
      </instancedMesh>

      <instancedMesh
        ref={skyRef}
        args={[null as any, null as any, MAX_BUILDINGS]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} toneMapped={false} />
      </instancedMesh>

      <instancedMesh ref={wireRef} args={[null as any, null as any, MAX_BUILDINGS]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe transparent opacity={0.6} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export function Cityscape({ etfs, isRotating }: CityscapeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'theme-cyberpunk';
  const [hoveredBuilding, setHoveredBuilding] = useState<PlacedBuilding | null>(null);

  const cityData = useMemo(() => layoutCityscape(etfs), [etfs]);

  return (
    <Card className="p-0 hover:border-primary/50 transition-colors duration-500 border border-border bg-card/40 backdrop-blur-md overflow-hidden relative">
      <CardContent className="p-0">
        <div className="h-[600px] w-full relative bg-[#030712] overflow-hidden">
          <Canvas camera={{ position: [0, 30, 40], fov: 45 }}>
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-10, 5, -10]} intensity={0.8} color="#22d3ee" />

            <EffectComposer>
              <Bloom
                luminanceThreshold={1.0}
                luminanceSmoothing={0.5}
                intensity={isDark ? 2.5 : 1.2}
              />
            </EffectComposer>

            <Stars radius={100} depth={50} count={2000} factor={2} fade speed={0.5} />
            <group rotation={[-Math.PI / 2, 0, 0]}>
              <AnimatedGround width={cityData.totalWidth} height={cityData.totalHeight} />

              {cityData.districtPlanes.map((plane, i) => (
                <AnimatedDistrictPad key={`pad-${i}-${plane.name}`} plane={plane} />
              ))}

              <FastBuildings
                buildings={cityData.buildings}
                hoveredBuilding={hoveredBuilding}
                setHoveredBuilding={setHoveredBuilding}
              />

              {cityData.buildings
                .filter((b) => b.isLargest)
                .map((b) => (
                  <HighestBuildingLabel
                    key={`highest-${b.sector}-${b.name}`}
                    b={b}
                    isHovered={hoveredBuilding?.name === b.name}
                  />
                ))}
            </group>

            <OrbitControls
              enableZoom={true}
              autoRotate={isRotating}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 2 - 0.1}
              minDistance={10}
              maxDistance={80}
            />
          </Canvas>

          {/* Hover Tooltip Overlay */}
          {hoveredBuilding && (
            <div className="absolute top-4 right-4 pointer-events-none bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-lg flex flex-col gap-1 min-w-40">
              <p className="text-xs font-bold text-foreground truncate max-w-40">
                {hoveredBuilding.name}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase">
                {hoveredBuilding.sector}
              </p>
              <p className="text-lg font-mono text-cyan-400 mt-1">
                {hoveredBuilding.value.toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

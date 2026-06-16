import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EtfConfig } from '@/lib/types';
import { useSpring, animated } from '@react-spring/three';

import { RotationControls } from './RotationControls';
import { Label } from '@/components/ui/label';
import { CameraPersistence } from '@/components/charts/3d/CameraPersistence';
import { calculateTerrainOverlapMatrix, generateTerrainGeometry } from '@/lib/math/terrain';

interface TerrainViewProps {
  etfs: EtfConfig[];
  isActive: boolean;
  globeRotating: boolean;
  setGlobeRotating: (r: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

function Terrain({ etfs }: { etfs: EtfConfig[] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const overlapMatrix = useMemo(() => calculateTerrainOverlapMatrix(etfs), [etfs]);

  const geometry = useMemo(() => {
    return generateTerrainGeometry(overlapMatrix, etfs.length);
  }, [overlapMatrix, etfs.length]);

  // Labels for the axes
  const labels = useMemo(() => {
    const N = etfs.length;
    if (N <= 1) return [];
    const size = 10;
    const l = [];
    for (let i = 0; i < N; i++) {
      const pos = (i / (N - 1)) * size - size / 2;
      l.push({ text: etfs[i].name, pos });
    }
    return l;
  }, [etfs]);

  const springs = useSpring({
    from: { scaleZ: 0 },
    to: { scaleZ: 1 },
    config: { mass: 1, tension: 170, friction: 26 },
  });

  return (
    <group rotation={[-Math.PI / 2.5, 0, 0]}>
      <animated.mesh ref={meshRef} geometry={geometry} scale-z={springs.scaleZ}>
        <meshStandardMaterial
          vertexColors
          roughness={0.8}
          metalness={0.2}
          wireframe={false}
          side={THREE.DoubleSide}
        />
        {/* Wireframe overlay */}
        <mesh geometry={geometry}>
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.1} />
        </mesh>

        {/* Axis Labels - X Axis (Front edge) */}
        {labels.map((label, i) => (
          <Text
            key={`x-${i}`}
            position={[label.pos, -5.5, 0]}
            rotation={[0, 0, -Math.PI / 4]}
            fontSize={0.35}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {label.text}
          </Text>
        ))}
        {/* Axis Labels - Y Axis (Right edge) */}
        {labels.map((label, i) => (
          <Text
            key={`y-${i}`}
            position={[5.5, label.pos, 0]}
            fontSize={0.35}
            color="white"
            anchorX="left"
            anchorY="middle"
          >
            {label.text}
          </Text>
        ))}
      </animated.mesh>
    </group>
  );
}

export function TerrainView({
  etfs,
  isActive,
  globeRotating,
  setGlobeRotating,
  t,
}: TerrainViewProps) {
  if (!isActive) return null;

  if (etfs.length < 2) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
          <div className="flex flex-col gap-2 min-w-35">
            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
              {t.pages.analyzer.dashboard.tabs.threeDVisuals.analyzedEtfs}
            </Label>
            <span className="text-sm font-medium text-primary">{etfs.length}</span>
          </div>
        </div>
        <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-xl border border-border">
          <p className="text-muted-foreground">
            {t.pages.analyzer.dashboard.tabs.threeDVisuals.needTwoEtfsTerrain}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex flex-col gap-2 min-w-35 shrink-0">
            <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
              {t.pages.analyzer.dashboard.tabs.threeDVisuals.analyzedEtfs}
            </Label>
            <span className="text-sm font-medium text-primary">{etfs.length}</span>
          </div>

          <div className="hidden md:block w-px h-10 bg-border"></div>

          <div className="flex flex-col gap-1 max-w-[400px]">
            <h3 className="text-sm font-semibold text-foreground">
              {t.pages.analyzer.dashboard.tabs.threeDVisuals.topographicOverlap}
            </h3>
            <p className="text-muted-foreground text-xs leading-snug">
              {t.pages.analyzer.dashboard.tabs.threeDVisuals.topographicDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <RotationControls
            isRotating={globeRotating}
            onToggle={() => setGlobeRotating(!globeRotating)}
            t={t}
          />
        </div>
      </div>

      <div className="w-full h-[500px] relative bg-slate-950 rounded-xl overflow-hidden shadow-inner border border-border">
        <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
          <CameraPersistence storageKey="camera_terrain" />
          <color attach="background" args={['#020617']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          <Terrain etfs={etfs} />

          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={25}
            maxPolarAngle={Math.PI / 2 - 0.1}
            autoRotate={globeRotating}
            autoRotateSpeed={0.5}
          />
        </Canvas>
      </div>
    </div>
  );
}

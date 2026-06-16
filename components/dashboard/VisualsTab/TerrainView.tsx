import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { EtfConfig } from '@/lib/types';
import { useSpring, animated } from '@react-spring/three';

import { RotationControls } from './RotationControls';
import { Label } from '@/components/ui/label';
import { CameraPersistence } from '@/components/charts/3d/CameraPersistence';

interface TerrainViewProps {
  etfs: EtfConfig[];
  isActive: boolean;
  globeRotating: boolean;
  setGlobeRotating: (r: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}

// Bilinear interpolation
function bilerp(c00: number, c10: number, c01: number, c11: number, tx: number, ty: number) {
  return c00 * (1 - tx) * (1 - ty) + c10 * tx * (1 - ty) + c01 * (1 - tx) * ty + c11 * tx * ty;
}

// Smoothstep for more natural curves
function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

function Terrain({ etfs }: { etfs: EtfConfig[] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { overlapMatrix } = useMemo(() => {
    const N = etfs.length;
    if (N === 0) return { overlapMatrix: [], maxOverlap: 0 };

    const matrix = Array.from({ length: N }, () => Array(N).fill(0));

    // Compute holdings maps
    const holdingsMaps = etfs.map((etf) => {
      const map = new Map<string, number>();
      etf.holdings.forEach((h) => {
        // Normalize weight relative to the ETF itself (so sum is 1)
        map.set(h.ticker, h.weight / 100);
      });
      return map;
    });

    let maxO = 0.001; // Avoid div by zero
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if (i === j) {
          matrix[i][j] = 1; // Self overlap is 100%
        } else {
          let overlap = 0;
          const mapA = holdingsMaps[i];
          const mapB = holdingsMaps[j];
          mapA.forEach((weightA, ticker) => {
            if (mapB.has(ticker)) {
              overlap += Math.min(weightA, mapB.get(ticker)!);
            }
          });
          matrix[i][j] = overlap;
          if (overlap > maxO) maxO = overlap;
        }
      }
    }

    return { overlapMatrix: matrix };
  }, [etfs]);

  const { geometry } = useMemo(() => {
    const N = etfs.length;
    const planeSize = 10;
    const segments = 64;
    const geom = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
    const posAttribute = geom.attributes.position;

    const colors = [];
    const color = new THREE.Color();

    for (let i = 0; i < posAttribute.count; i++) {
      const x = posAttribute.getX(i);
      const y = posAttribute.getY(i);

      // Map x, y from [-planeSize/2, planeSize/2] to [0, N-1]
      const nx = (x + planeSize / 2) / planeSize;
      const ny = (y + planeSize / 2) / planeSize;

      let u = nx * (N - 1);
      let v = ny * (N - 1);

      if (N <= 1) {
        u = 0;
        v = 0;
      }

      const u0 = Math.floor(u);
      const u1 = Math.min(u0 + 1, N - 1);
      const v0 = Math.floor(v);
      const v1 = Math.min(v0 + 1, N - 1);

      const tx = smoothstep(u - u0);
      const ty = smoothstep(v - v0);

      let height = 0;
      if (N > 0) {
        const c00 = overlapMatrix[v0][u0];
        const c10 = overlapMatrix[v0][u1];
        const c01 = overlapMatrix[v1][u0];
        const c11 = overlapMatrix[v1][u1];
        height = bilerp(c00, c10, c01, c11, tx, ty);
      }

      // Add some high-frequency noise based on height to make it look like a mountain
      const noise = Math.sin(x * 5) * Math.cos(y * 5) * 0.05 * height;

      const finalHeight = (height + noise) * 3; // Scale Z
      posAttribute.setZ(i, finalHeight);

      // Color mapping: valleys are dark/blue-ish green, peaks are white
      if (height < 0.1) {
        color.setHSL(0.3, 0.5, 0.2 + height);
      } else if (height < 0.5) {
        color.setHSL(0.25, 0.6, 0.2 + height);
      } else if (height < 0.8) {
        color.setHSL(0.1, 0.4, height);
      } else {
        color.setHSL(0, 0, height);
      }
      colors.push(color.r, color.g, color.b);
    }

    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.computeVertexNormals();
    return { geometry: geom };
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
      {/* @ts-expect-error - animated.mesh typing issue with three.js */}
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
              {t.threeDVisuals.analyzedEtfs}
            </Label>
            <span className="text-sm font-medium text-primary">{etfs.length}</span>
          </div>
        </div>
        <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 rounded-xl border border-border">
          <p className="text-muted-foreground">{t.threeDVisuals.needTwoEtfsTerrain}</p>
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
              {t.threeDVisuals.analyzedEtfs}
            </Label>
            <span className="text-sm font-medium text-primary">{etfs.length}</span>
          </div>

          <div className="hidden md:block w-px h-10 bg-border"></div>

          <div className="flex flex-col gap-1 max-w-[400px]">
            <h3 className="text-sm font-semibold text-foreground">
              {t.threeDVisuals.topographicOverlap}
            </h3>
            <p className="text-muted-foreground text-xs leading-snug">
              {t.threeDVisuals.topographicDesc}
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

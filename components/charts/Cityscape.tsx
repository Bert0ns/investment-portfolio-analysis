'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useSpring, a } from '@react-spring/three';
import * as THREE from 'three';
import { EtfConfig } from '../../lib/types';
import { normalizeSector } from '../../lib/math';
import { Card, CardContent } from '../ui/card';
import { useTheme } from 'next-themes';

interface CityscapeProps {
  etfs: EtfConfig[];
  isRotating: boolean;
}

interface HoldingData {
  name: string;
  value: number;
}

interface SectorGroup {
  name: string;
  value: number;
  children: HoldingData[];
}

interface PlacedBuilding {
  name: string;
  value: number;
  sector: string;
  color: string;
  x: number;
  y: number;
  size: number;
  depth: number;
}

const SECTOR_COLORS: Record<string, string> = {
  'Information Technology': '#22d3ee', // cyan
  IT: '#22d3ee',
  Tecnologia: '#22d3ee',
  Financials: '#3b82f6', // blue
  Finanza: '#3b82f6',
  'Health Care': '#f472b6', // pink
  Salute: '#f472b6',
  Healthcare: '#f472b6',
  'Consumer Discretionary': '#f59e0b', // amber
  'Beni voluttuari': '#f59e0b',
  Industrials: '#64748b', // slate
  Industria: '#64748b',
  'Consumer Staples': '#10b981', // emerald
  'Beni di prima necessità': '#10b981',
  Energy: '#ef4444', // red
  Energia: '#ef4444',
  Utilities: '#8b5cf6', // violet
  'Real Estate': '#14b8a6', // teal
  Immobiliare: '#14b8a6',
  Materials: '#84cc16', // lime
  Materiali: '#84cc16',
  'Communication Services': '#d946ef', // fuchsia
  Telecomunicazioni: '#d946ef',
  Unknown: '#71717a',
};

function getSectorColor(sector: string): string {
  if (SECTOR_COLORS[sector]) return SECTOR_COLORS[sector];
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = sector.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 80%, 50%)`;
}

function buildSectorGroups(etfs: EtfConfig[]): SectorGroup[] {
  const holdingMap = new Map<string, { name: string; sector: string; value: number }>();

  etfs
    .filter((e) => e.globalWeight > 0)
    .forEach((etf) => {
      const etfWeight = etf.globalWeight;
      etf.holdings.forEach((h) => {
        const normalizedSector = normalizeSector(h.sector);
        const key = `${normalizedSector}-${h.name || h.ticker}`;
        const absWeight = (h.weight / 100) * etfWeight;

        if (!holdingMap.has(key)) {
          holdingMap.set(key, {
            name: h.name || h.ticker,
            sector: normalizedSector || 'Unknown',
            value: 0,
          });
        }
        holdingMap.get(key)!.value += absWeight;
      });
    });

  const sectorMap = new Map<string, SectorGroup>();
  for (const h of holdingMap.values()) {
    if (!sectorMap.has(h.sector)) {
      sectorMap.set(h.sector, { name: h.sector, value: 0, children: [] });
    }
    const group = sectorMap.get(h.sector)!;
    group.value += h.value;
    group.children.push({ name: h.name, value: h.value });
  }

  const sectors = Array.from(sectorMap.values());
  sectors.sort((a, b) => {
    const maxA = a.children.length > 0 ? Math.max(...a.children.map((c) => c.value)) : 0;
    const maxB = b.children.length > 0 ? Math.max(...b.children.map((c) => c.value)) : 0;
    return maxB - maxA;
  });

  return sectors;
}

function isColliding(
  x: number,
  y: number,
  size: number,
  placed: PlacedBuilding[],
  gap: number
): boolean {
  for (const pb of placed) {
    const minDistanceX = (size + pb.size) / 2 + gap;
    const minDistanceY = (size + pb.size) / 2 + gap;
    if (Math.abs(x - pb.x) < minDistanceX && Math.abs(y - pb.y) < minDistanceY) {
      return true;
    }
  }
  return false;
}

function packBuildingsInSector(
  sector: SectorGroup,
  centerX: number,
  centerY: number,
  districtSize: number
): PlacedBuilding[] {
  const placedBuildings: PlacedBuilding[] = [];
  const sectorColor = getSectorColor(sector.name);
  const children = [...sector.children].sort((a, b) => b.value - a.value);

  for (const child of children) {
    const areaShare = (child.value / sector.value) * (districtSize * districtSize) * 0.35;
    const size = Math.max(0.4, Math.min(Math.sqrt(areaShare), 2.5));
    const depth = Math.max(1, Math.pow(child.value, 0.85) * 10);
    const GAP = 0.4;
    let angle = 0;

    while (angle < 300) {
      const radius = 0.4 * angle;
      const localX = Math.cos(angle) * radius;
      const localY = Math.sin(angle) * radius;
      const globalX = centerX + localX;
      const globalY = centerY + localY;

      if (
        Math.abs(localX) + size / 2 <= districtSize / 2 - 0.5 &&
        Math.abs(localY) + size / 2 <= districtSize / 2 - 0.5 &&
        !isColliding(globalX, globalY, size, placedBuildings, GAP)
      ) {
        placedBuildings.push({
          name: child.name,
          value: child.value,
          sector: sector.name,
          color: sectorColor,
          x: globalX,
          y: globalY,
          size,
          depth,
        });
        break;
      }
      angle += 0.5;
    }
  }
  return placedBuildings;
}

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
    <a.mesh position-x={x} position-y={y} position-z={0} scale-x={size} scale-y={size} scale-z={1}>
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={plane.color} opacity={0.12} transparent depthWrite={false} />

      <mesh>
        <boxGeometry args={[1, 1, 0.05]} />
        <meshBasicMaterial color={plane.color} wireframe transparent opacity={0.2} />
      </mesh>
    </a.mesh>
  );
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

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

  useFrame((state, delta) => {
    // Framerate-independent lerp factor (similar to a spring)
    const factor = 1 - Math.exp(-15 * delta);
    let needsUpdate = false;

    buildings.forEach((b, i) => {
      let curr = animStates.current.get(b.name);
      if (!curr) {
        curr = { x: b.x, y: b.y, size: b.size, depth: b.depth, emissive: 0.3 };
        animStates.current.set(b.name, curr);
      }

      const isHovered = hoveredBuilding?.name === b.name;
      const targetEmissive = isHovered ? 1.0 : 0.3;

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
        wireRef.current.setColorAt(i, tempColor.set(b.color));
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
    });

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
    if (e.instanceId !== undefined) {
      setHoveredBuilding(buildings[e.instanceId]);
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    setHoveredBuilding(null);
  };

  return (
    <group>
      <instancedMesh ref={plazaRef} args={[null as any, null as any, count]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial opacity={0.08} transparent depthWrite={false} />
      </instancedMesh>

      <instancedMesh
        ref={skyRef}
        args={[null as any, null as any, count]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial metalness={0.9} roughness={0.1} />
      </instancedMesh>

      <instancedMesh ref={wireRef} args={[null as any, null as any, count]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial wireframe transparent opacity={0.4} />
      </instancedMesh>
    </group>
  );
}

export function Cityscape({ etfs, isRotating }: CityscapeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'theme-cyberpunk';
  const [hoveredBuilding, setHoveredBuilding] = useState<PlacedBuilding | null>(null);

  const cityData = useMemo(() => {
    const sectors = buildSectorGroups(etfs);

    const cols = Math.ceil(Math.sqrt(sectors.length));
    const DISTRICT_SIZE = 14;
    const ROAD_WIDTH = 2.5;

    const totalWidth = cols * DISTRICT_SIZE + (cols - 1) * ROAD_WIDTH;
    const rows = Math.ceil(sectors.length / cols);
    const totalHeight = rows * DISTRICT_SIZE + (rows - 1) * ROAD_WIDTH;

    const positions: { x: number; y: number; distance: number }[] = [];
    for (let i = 0; i < sectors.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const centerX = col * (DISTRICT_SIZE + ROAD_WIDTH) - totalWidth / 2 + DISTRICT_SIZE / 2;
      const centerY = row * (DISTRICT_SIZE + ROAD_WIDTH) - totalHeight / 2 + DISTRICT_SIZE / 2;
      positions.push({
        x: centerX,
        y: centerY,
        distance: Math.sqrt(centerX * centerX + centerY * centerY),
      });
    }
    positions.sort((a, b) => a.distance - b.distance);

    const buildings: PlacedBuilding[] = [];
    const districtPlanes = sectors.map((sector, index) => {
      const { x: centerX, y: centerY } = positions[index];
      const sectorColor = getSectorColor(sector.name);

      const sectorBuildings = packBuildingsInSector(sector, centerX, centerY, DISTRICT_SIZE);
      buildings.push(...sectorBuildings);

      return { x: centerX, y: centerY, size: DISTRICT_SIZE, color: sectorColor, name: sector.name };
    });

    return { buildings, districtPlanes, totalWidth, totalHeight };
  }, [etfs]);

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
                luminanceThreshold={0.2}
                luminanceSmoothing={0.9}
                intensity={isDark ? 1.5 : 0.5}
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

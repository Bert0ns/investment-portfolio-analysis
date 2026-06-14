'use client';

import React, { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { EtfConfig } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from 'next-themes';
import { useDebounce } from '@/hooks/useDebounce';

interface CityscapeProps {
  etfs: EtfConfig[];
  isRotating: boolean;
}

import {
  layoutCityscape,
  PlacedBuilding,
} from '@/components/charts/3d/CityscapeChart/CityscapeLayout';

import { HoveringTooltipOverlay } from '@/components/charts/3d/CityscapeChart/HoveredBuildingTooltipOvelay';

import {
  AnimatedGround,
  AnimatedDistrictPad,
  HighestBuildingLabel,
  FastBuildings,
} from '@/components/charts/3d/CityscapeChart/CityscapeComponents';

export function Cityscape({ etfs, isRotating }: CityscapeProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'theme-cyberpunk';
  const [hoveredBuilding, setHoveredBuilding] = useState<PlacedBuilding | null>(null);

  const debouncedEtfs = useDebounce(etfs, 400);
  const cityData = useMemo(() => layoutCityscape(debouncedEtfs), [debouncedEtfs]);

  return (
    <Card className="p-0 hover:border-primary/50 transition-colors duration-500 border border-border bg-card/40 backdrop-blur-md overflow-hidden relative">
      <CardContent className="p-0">
        <div className="h-150 w-full relative bg-[#030712] overflow-hidden">
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
          {hoveredBuilding && <HoveringTooltipOverlay hoveredBuilding={hoveredBuilding} />}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Play, Pause } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { GlobeMesh } from './globe/GlobeMesh';
import { BASE_COORDINATES, ALIASES } from '../../lib/utils/Coordinates';
import { useTranslation } from '../../lib/i18n/LanguageContext';

export function ExposureGlobe({ data }: { data: { name: string; value: number }[] }) {
  const { t } = useTranslation();
  const [isRotating, setIsRotating] = useState(true);

  // Calculate true number of mapped unique regions
  const uniqueRegionsCount = new Set(
    data
      .map((d) => ALIASES[d.name.trim()] || d.name.trim())
      .filter((name) => name !== 'Unknown' && name !== 'Unione Europea' && BASE_COORDINATES[name])
  ).size;

  return (
    <Card className="p-0 hover:border-primary/50 transition-colors duration-500 border border-border bg-card/40 backdrop-blur-md overflow-hidden">
      <CardContent className="p-0">
        <div className="h-[600px] w-full relative bg-[#030712] overflow-hidden">
          <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
            <ambientLight intensity={0.6} />
            <pointLight position={[10, 10, 10]} intensity={2.0} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />

            {/* Wrap the globe in Suspense while textures load */}
            <Suspense fallback={null}>
              <GlobeMesh data={data} isRotating={isRotating} />
            </Suspense>

            <EffectComposer>
              <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} intensity={0.8} />
            </EffectComposer>

            <Stars
              radius={100}
              depth={50}
              count={3000}
              factor={3}
              saturation={0}
              fade
              speed={1.5}
            />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate={isRotating}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 3}
            />
          </Canvas>

          {/* Overlay UI */}
          <div className="absolute bottom-6 left-6 pointer-events-none flex flex-col gap-3">
            <p className="text-[10px] text-amber-400 font-mono bg-black/40 px-3 py-1.5 border border-amber-500/30 backdrop-blur-md uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.1)] rounded-sm w-max">
              {uniqueRegionsCount} {t.threeDVisuals.regionsActive}
            </p>
            <button
              onClick={() => setIsRotating(!isRotating)}
              className="pointer-events-auto text-[10px] text-cyan-400 font-mono bg-black/40 px-3 py-1.5 border border-cyan-500/30 backdrop-blur-md uppercase tracking-widest hover:bg-cyan-900/40 transition-colors shadow-[0_0_10px_rgba(34,211,238,0.1)] rounded-sm flex items-center justify-center w-max gap-2"
            >
              {isRotating ? <Pause size={12} /> : <Play size={12} />}
              {isRotating ? t.threeDVisuals.pauseRotation : t.threeDVisuals.resumeRotation}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

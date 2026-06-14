'use client';

import React, { Suspense, useRef, forwardRef, useImperativeHandle } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Card, CardContent } from '@/components/ui/card';
import { GlobeMesh } from '@/components/charts/3d/GlobeExpusureChart/GlobeMesh';

export interface ExposureGlobeRef {
  zoomIn: () => void;
  zoomOut: () => void;
}

export const ExposureGlobe = forwardRef<
  ExposureGlobeRef,
  { data: { name: string; value: number }[]; isRotating: boolean }
>(({ data, isRotating }, ref) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    zoomIn: () => handleZoom('in'),
    zoomOut: () => handleZoom('out'),
  }));

  const handleZoom = (direction: 'in' | 'out') => {
    if (controlsRef.current && controlsRef.current.object) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const currentDistance = camera.position.distanceTo(target);
      const factor = direction === 'in' ? 0.8 : 1.25;
      const newDistance = Math.max(
        controlsRef.current.minDistance || 3,
        Math.min(controlsRef.current.maxDistance || 12, currentDistance * factor)
      );
      camera.position.lerp(target, 1 - newDistance / currentDistance);
      controlsRef.current.update();
    }
  };

  return (
    <Card className="p-0 hover:border-primary/50 transition-colors duration-500 border border-border bg-card/40 backdrop-blur-md overflow-hidden">
      <CardContent className="p-0">
        <div className="h-150 w-full relative bg-[#030712] overflow-hidden">
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
              ref={controlsRef}
              enableZoom={true}
              minDistance={3}
              maxDistance={12}
              enablePan={false}
              autoRotate={isRotating}
              autoRotateSpeed={0.5}
              maxPolarAngle={Math.PI / 1.5}
              minPolarAngle={Math.PI / 4}
            />
          </Canvas>
        </div>
      </CardContent>
    </Card>
  );
});

ExposureGlobe.displayName = 'ExposureGlobe';

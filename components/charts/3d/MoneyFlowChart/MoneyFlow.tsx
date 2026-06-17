import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EtfConfig } from '@/lib/types';
import { CameraPersistence } from '@/components/charts/3d/CameraPersistence';
import { generateMoneyFlowData } from '@/lib/math/moneyFlowLayout';
import { MoneyFlowComponents } from './MoneyFlowComponents';

interface MoneyFlowProps {
  etfs: EtfConfig[];
  topHoldingsCount?: number;
  isRotating?: boolean;
  ctrlPressed?: boolean;
}

export function MoneyFlow({
  etfs,
  topHoldingsCount = 30,
  isRotating = true,
  ctrlPressed = false,
}: MoneyFlowProps) {
  const { nodes, links } = useMemo(
    () => generateMoneyFlowData(etfs, topHoldingsCount),
    [etfs, topHoldingsCount]
  );

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 20, 40], fov: 45 }} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <CameraPersistence storageKey="camera_moneyflow_v2" />

          <color attach="background" args={['#09090b']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.5} />

          <Environment preset="city" />

          <OrbitControls
            makeDefault
            enableDamping
            enableZoom={ctrlPressed}
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={300}
            autoRotate={isRotating}
            autoRotateSpeed={0.5}
            mouseButtons={{
              LEFT: THREE.MOUSE.PAN,
              MIDDLE: THREE.MOUSE.DOLLY,
              RIGHT: THREE.MOUSE.ROTATE,
            }}
            touches={{
              ONE: THREE.TOUCH.PAN,
              TWO: THREE.TOUCH.DOLLY_ROTATE,
            }}
          />

          <group scale={0.3} position={[-5, -10, 0]}>
            {nodes.length > 0 && (
              <MoneyFlowComponents
                key={`moneyflow-${topHoldingsCount}`}
                nodes={nodes}
                links={links}
              />
            )}
          </group>
        </Suspense>
      </Canvas>
    </div>
  );
}

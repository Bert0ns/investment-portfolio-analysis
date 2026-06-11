'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getCoordinates } from './Coordinates';

export function Pillar({
  name,
  lat,
  lng,
  value,
  maxValue,
}: {
  name: string;
  lat: number;
  lng: number;
  value: number;
  maxValue: number;
}) {
  const radius = 2;
  const pos = getCoordinates(lat, lng, radius);

  const targetHeight = Math.max(0.05, (value / maxValue) * 1.5);
  const targetRatio = value / maxValue;
  const targetDistanceFactor = 4 + targetRatio * 8;

  const groupRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const labelGroupRef = useRef<THREE.Group>(null);

  const currentHeight = useRef(0.01);

  React.useEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(0, 0, 0);
    }
  }, [pos]);

  useFrame((state, delta) => {
    currentHeight.current = THREE.MathUtils.damp(currentHeight.current, targetHeight, 6, delta);

    if (cylinderRef.current) {
      cylinderRef.current.scale.y = currentHeight.current;
      cylinderRef.current.position.z = -currentHeight.current / 2;
    }

    if (labelGroupRef.current) {
      labelGroupRef.current.position.z = -currentHeight.current - 0.1;
    }
  });

  return (
    <group position={pos} ref={groupRef}>
      <mesh ref={cylinderRef} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1, 8]} />
        <meshStandardMaterial color="#fcd34d" emissive="#f59e0b" emissiveIntensity={2.0} />
      </mesh>

      <group ref={labelGroupRef}>
        <Html center distanceFactor={targetDistanceFactor}>
          <div className="px-1.5 py-1 bg-[#020617]/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-mono text-[7px] leading-tight rounded-sm flex flex-col items-center shadow-none whitespace-nowrap">
            <span className="font-bold tracking-wider uppercase">{name}</span>
            <span className="opacity-80">{value.toFixed(1)}%</span>
          </div>
        </Html>
      </group>
    </group>
  );
}

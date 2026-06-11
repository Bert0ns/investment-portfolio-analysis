'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useLoader } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import { Pillar } from './Pillar';
import { BASE_COORDINATES, ALIASES } from './Coordinates';

export function GlobeMesh({
  data,
  isRotating,
}: {
  data: { name: string; value: number }[];
  isRotating: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const mergedDataMap: Record<string, number> = {};
  data.forEach((item) => {
    const rawName = item.name.trim();
    const mappedName = ALIASES[rawName] || rawName;

    if (mappedName === 'Unknown' || rawName === 'Unione Europea') return;

    const coords = BASE_COORDINATES[mappedName];
    if (!coords) return;

    if (!mergedDataMap[mappedName]) {
      mergedDataMap[mappedName] = 0;
    }
    mergedDataMap[mappedName] += item.value;
  });

  const mergedData = Object.entries(mergedDataMap).map(([name, value]) => ({ name, value }));
  const maxValue = Math.max(...mergedData.map((d) => d.value), 1);

  const topologyMap = useLoader(THREE.TextureLoader, '/earth-topology.png');

  useFrame(() => {
    if (groupRef.current && isRotating) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group ref={groupRef}>
      <Sphere args={[2, 64, 64]}>
        <meshStandardMaterial
          color="#1e293b"
          emissiveMap={topologyMap}
          emissive="#22d3ee"
          emissiveIntensity={0.7}
          bumpMap={topologyMap}
          bumpScale={0.03}
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      <Sphere args={[2.05, 64, 64]}>
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>

      {mergedData.map((item, i) => {
        const coords = BASE_COORDINATES[item.name];
        if (!coords) return null;

        return (
          <Pillar
            key={i}
            name={item.name}
            lat={coords[0]}
            lng={coords[1]}
            value={item.value}
            maxValue={maxValue}
          />
        );
      })}
    </group>
  );
}

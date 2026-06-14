'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

function PortfolioNetwork({
  theme,
  mouseRef,
}: {
  theme: string;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const isDark = theme === 'theme-cyberpunk';

  const NODE_COUNT = 300;
  const RADIUS = 12;

  // Pre-calculate the network geometry once
  const { positionsArray, lineGeometry } = useMemo(() => {
    let seed = 12345;
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const pos = [];

    // Generate nodes clustered towards the center using a sphere distribution
    for (let i = 0; i < NODE_COUNT; i++) {
      const u = random();
      const v = random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Power of 1/3 concentrates nodes towards the center for a dense core
      const r = Math.pow(random(), 1 / 3) * RADIUS;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      pos.push(new THREE.Vector3(x, y, z));
    }

    const linePoints = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        // Connect nodes that are close to each other to form the "portfolio network"
        if (pos[i].distanceTo(pos[j]) < 3.0) {
          linePoints.push(pos[i], pos[j]);
        }
      }
    }

    const lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);

    // Convert Vector3[] to Float32Array for high-performance Points rendering
    const positionsArray = new Float32Array(NODE_COUNT * 3);
    for (let i = 0; i < NODE_COUNT; i++) {
      positionsArray[i * 3] = pos[i].x;
      positionsArray[i * 3 + 1] = pos[i].y;
      positionsArray[i * 3 + 2] = pos[i].z;
    }

    return { positionsArray, lineGeometry };
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Glacial majestic rotation
      groupRef.current.rotation.y = time * 0.003;
      groupRef.current.rotation.z = Math.sin(time * 0.002) * 0.03;

      // Smooth Mouse Parallax (Rotation)
      const targetX = (mouseRef.current.y * Math.PI) / 12;
      const targetY = (mouseRef.current.x * Math.PI) / 12;

      groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.008;
      groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.008;

      // Smooth Mouse Parallax (Horizontal & Vertical Movement)
      const targetPosX = mouseRef.current.x * 1.5;
      const targetPosY = mouseRef.current.y * 1.5;

      groupRef.current.position.x += (targetPosX - groupRef.current.position.x) * 0.008;
      groupRef.current.position.y += (targetPosY - groupRef.current.position.y) * 0.008;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Network Nodes (Assets) */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positionsArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={isDark ? '#22d3ee' : '#3b82f6'}
          size={0.12}
          transparent
          opacity={isDark ? 0.9 : 0.7}
          sizeAttenuation
        />
      </points>

      {/* Network Connections (Correlations) */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          color={isDark ? '#8b5cf6' : '#94a3b8'}
          transparent
          opacity={isDark ? 0.25 : 0.15}
        />
      </lineSegments>
    </group>
  );
}

export default function Landing3DBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize to -1 to 1
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!mounted) return null;

  const isDark = resolvedTheme === 'theme-cyberpunk';

  return (
    <div
      className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isDark ? 'opacity-90' : 'opacity-40'}`}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={isDark ? 0.5 : 2} />
        <directionalLight position={[10, 10, 5]} intensity={isDark ? 2 : 3} color="#ffffff" />
        <pointLight
          position={[-10, -10, -5]}
          intensity={isDark ? 3 : 1}
          color={isDark ? '#22d3ee' : '#3b82f6'}
        />

        {isDark && (
          <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.02} />
        )}

        <PortfolioNetwork theme={resolvedTheme || 'theme-professional'} mouseRef={mouseRef} />
      </Canvas>
    </div>
  );
}

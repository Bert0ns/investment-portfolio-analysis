'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  Float,
  Icosahedron,
  OrbitControls,
  PointMaterial,
  Points,
  Stars,
  Torus,
  MeshDistortMaterial,
} from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

/** Colors used across the scene, resolved from the active theme. */
interface ScenePalette {
  accent: string;
  accent2: string;
}

const FALLBACK_PALETTE: ScenePalette = { accent: '#22d3ee', accent2: '#3b82f6' };

/**
 * Decorative geometry is randomized once at module load. Generating it outside
 * of render keeps components pure (no impure calls during render).
 */
const PARTICLE_POSITIONS: Float32Array = (() => {
  const count = 2200;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 3.4 + Math.random() * 1.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
})();

interface Shard {
  position: [number, number, number];
  scale: number;
  speed: number;
}

const SHARDS: Shard[] = Array.from({ length: 7 }, () => ({
  position: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4 - 1],
  scale: 0.1 + Math.random() * 0.18,
  speed: 1 + Math.random() * 2,
}));

/**
 * Resolves a CSS custom property (which may be in oklch) to an rgb() string
 * that THREE.Color can parse. The browser computes the value for us.
 */
function resolveCssColor(variable: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const probe = document.createElement('span');
  probe.style.color = `var(${variable})`;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved && resolved.startsWith('rgb') ? resolved : fallback;
}

/** Reads the scene palette from theme tokens and updates when the theme changes. */
function useThemePalette(): ScenePalette {
  const [palette, setPalette] = useState<ScenePalette>(FALLBACK_PALETTE);

  useEffect(() => {
    const read = () =>
      setPalette({
        accent: resolveCssColor('--primary', FALLBACK_PALETTE.accent),
        accent2: resolveCssColor('--chart-2', FALLBACK_PALETTE.accent2),
      });

    read();

    // Theme is applied via a class on <html>; re-read when it changes.
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/** A rotating point cloud distributed across a sphere surface. */
function ParticleField({ color }: { color: string }) {
  const ref = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.04;
      ref.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={PARTICLE_POSITIONS} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.8}
      />
    </Points>
  );
}

/** The central morphing core. */
function Core({ palette }: { palette: ScenePalette }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15;
      group.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <group ref={group}>
      <Icosahedron args={[1.35, 6]}>
        <MeshDistortMaterial
          color={palette.accent2}
          emissive={palette.accent}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.9}
          distort={0.35}
          speed={1.6}
        />
      </Icosahedron>
      <Icosahedron args={[1.7, 1]}>
        <meshBasicMaterial color={palette.accent} wireframe transparent opacity={0.18} />
      </Icosahedron>
    </group>
  );
}

/** Orbiting rings around the core. */
function Rings({ palette }: { palette: ScenePalette }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = Math.PI / 3 + Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  return (
    <group ref={ref}>
      <Torus args={[2.4, 0.012, 16, 120]}>
        <meshBasicMaterial color={palette.accent} transparent opacity={0.5} />
      </Torus>
      <Torus args={[2.9, 0.01, 16, 120]} rotation={[Math.PI / 2.5, 0, 0]}>
        <meshBasicMaterial color={palette.accent2} transparent opacity={0.35} />
      </Torus>
    </group>
  );
}

/** Small floating geometric shards. */
function Shards({ palette }: { palette: ScenePalette }) {
  return (
    <>
      {SHARDS.map((s, i) => (
        <Float key={i} speed={s.speed} rotationIntensity={2} floatIntensity={2}>
          <mesh position={s.position} scale={s.scale}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? palette.accent : palette.accent2}
              emissive={i % 2 === 0 ? palette.accent : palette.accent2}
              emissiveIntensity={0.6}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

/** Subtle parallax driven by pointer position. */
function ParallaxRig() {
  useFrame((state) => {
    const { camera, pointer } = state;
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04;
    camera.position.y += (pointer.y * 0.4 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene() {
  const palette = useThemePalette();

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={2} color="#ffffff" />
      <pointLight position={[-10, -8, -6]} intensity={1.2} color={palette.accent2} />
      <pointLight position={[0, 0, 4]} intensity={1.5} color={palette.accent} />

      <Core palette={palette} />
      <Rings palette={palette} />
      <Shards palette={palette} />
      <ParticleField color={palette.accent} />

      <Stars radius={120} depth={60} count={2500} factor={4} saturation={0} fade speed={1} />

      <ParallaxRig />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.4}
        maxPolarAngle={Math.PI / 1.6}
        minPolarAngle={Math.PI / 3}
        enableDamping
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.35} luminanceSmoothing={0.9} intensity={1.1} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}

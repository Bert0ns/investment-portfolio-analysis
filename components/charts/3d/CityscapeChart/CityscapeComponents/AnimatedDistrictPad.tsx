import React from 'react';
import { Html } from '@react-three/drei';
import { useSpring, a } from '@react-spring/three';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function AnimatedDistrictPad({
  plane,
}: {
  plane: { x: number; y: number; size: number; color: string; name: string };
}) {
  const { t } = useTranslation();
  const { x, y, size } = useSpring({
    x: plane.x,
    y: plane.y,
    size: plane.size,
    config: { mass: 1, tension: 100, friction: 20 },
  });

  return (
    <a.group position-x={x} position-y={y} position-z={0}>
      <a.mesh scale-x={size} scale-y={size} scale-z={1}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={plane.color} opacity={0.12} transparent depthWrite={false} />

        <mesh>
          <boxGeometry args={[1, 1, 0.05]} />
          <meshBasicMaterial color={plane.color} wireframe transparent opacity={0.2} />
        </mesh>
      </a.mesh>

      {/* District Name Label */}
      <a.group position-y={size.to((s) => s / 2 + 0.5)} position-z={0.1}>
        <Html center zIndexRange={[100, 0]} className="pointer-events-none opacity-90">
          <div
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,1)]"
            style={{ color: plane.color }}
          >
            {t.data.sectors[plane.name as keyof typeof t.data.sectors] || plane.name}
          </div>
        </Html>
      </a.group>
    </a.group>
  );
}

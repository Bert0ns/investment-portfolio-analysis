import { useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CameraPersistence({ storageKey }: { storageKey: string }) {
  const { camera } = useThree();
  const [targetPos, setTargetPos] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    // Restore camera position on mount
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          typeof parsed.x === 'number' &&
          !isNaN(parsed.x) &&
          typeof parsed.y === 'number' &&
          !isNaN(parsed.y) &&
          typeof parsed.z === 'number' &&
          !isNaN(parsed.z)
        ) {
          // Trigger smooth fly-in animation instead of instantaneous jump
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setTargetPos(new THREE.Vector3(parsed.x, parsed.y, parsed.z));

          // Failsafe: stop forcing the camera after 1.5s to restore manual user controls
          setTimeout(() => {
            setTargetPos(null);
          }, 1500);
        }
      }
    } catch (e) {
      console.warn(`Could not restore camera position for ${storageKey}`, e);
    }

    const savePosition = () => {
      try {
        const { x, y, z } = camera.position;
        window.localStorage.setItem(storageKey, JSON.stringify({ x, y, z }));
      } catch {
        // ignore
      }
    };

    // Periodically save camera state
    const interval = setInterval(savePosition, 1000);
    window.addEventListener('beforeunload', savePosition);

    const handleClear = () => {
      window.localStorage.removeItem(storageKey);
      setTargetPos(null);
    };

    window.addEventListener('clear_ui_state', handleClear);

    return () => {
      savePosition();
      clearInterval(interval);
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener('clear_ui_state', handleClear);
    };
  }, [camera, storageKey]);

  // Handle smooth fly-in animation on mount
  useFrame((state, delta) => {
    if (targetPos) {
      camera.position.lerp(targetPos, 4 * delta); // Faster easing

      // Stop animating when we are reasonably close to the target to avoid Zeno's paradox
      if (camera.position.distanceTo(targetPos) < 0.5) {
        setTargetPos(null);
      }
    }
  });

  return null;
}

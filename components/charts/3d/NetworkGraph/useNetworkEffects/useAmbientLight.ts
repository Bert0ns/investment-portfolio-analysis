import { useEffect } from 'react';
import * as THREE from 'three';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAmbientLight(fgRef: React.MutableRefObject<any>) {
  useEffect(() => {
    let ambientLight: THREE.AmbientLight | null = null;
    const currentFg = fgRef.current;

    const timer = setTimeout(() => {
      if (currentFg) {
        const scene = currentFg.scene();
        ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
        scene.add(ambientLight);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (currentFg && ambientLight) {
        currentFg.scene().remove(ambientLight);
      }
    };
  }, [fgRef]);
}

import { useEffect } from 'react';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export function useBloomEffect(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fgRef: React.MutableRefObject<any>,
  isDark: boolean,
  resolvedTheme: string | undefined
) {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bloomPass: any = null;
    const currentFg = fgRef.current;

    const timer = setTimeout(() => {
      if (currentFg) {
        try {
          const composer = currentFg.postProcessingComposer();
          if (composer) {
            const hasBloom = composer.passes.some(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.constructor.name === 'UnrealBloomPass'
            );

            if (isDark && !hasBloom) {
              bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.02,
                0.4,
                0.2
              );
              composer.addPass(bloomPass);
            }
          }
        } catch {
          // ignore
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (bloomPass) {
        if (currentFg) {
          try {
            const composer = currentFg.postProcessingComposer();
            if (composer) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              composer.passes = composer.passes.filter((p: any) => p !== bloomPass);
            }
          } catch {
            // ignore
          }
        }
        setTimeout(() => {
          try {
            if (typeof bloomPass.dispose === 'function') bloomPass.dispose();
          } catch {
            // ignore
          }
        }, 500);
      }
    };
  }, [resolvedTheme, isDark, fgRef]);
}

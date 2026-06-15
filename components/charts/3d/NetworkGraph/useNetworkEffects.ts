import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { NodeObj } from './types';
import { CAMERA_STORAGE_KEY, CLEAR_UI_EVENT } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function usePhysicsReheat(fgRef: React.MutableRefObject<any>, livePhysics: boolean) {
  const prevLivePhysics = useRef(livePhysics);

  useEffect(() => {
    if (prevLivePhysics.current !== livePhysics) {
      prevLivePhysics.current = livePhysics;
      const timer = setTimeout(() => {
        if (fgRef.current && fgRef.current.d3ReheatSimulation) {
          try {
            fgRef.current.d3ReheatSimulation();
          } catch (e) {
            console.warn('Reheat failed:', e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [livePhysics, fgRef]);
}

export function usePhysicsTweaks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fgRef: React.MutableRefObject<any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  isHighVolume: boolean,
  isExtremeVolume: boolean,
  overlapOnly?: boolean
) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fgRef.current) {
        try {
          const centerForce = fgRef.current.d3Force('center');
          if (centerForce) centerForce.strength(0);

          const chargeForce = fgRef.current.d3Force('charge');
          if (chargeForce) {
            chargeForce.strength(
              overlapOnly ? -300 : isExtremeVolume ? -40 : isHighVolume ? -60 : -100
            );
          }

          const linkForce = fgRef.current.d3Force('link');
          if (linkForce) {
            linkForce.distance(overlapOnly ? 150 : isExtremeVolume ? 50 : isHighVolume ? 70 : 90);
          }

          fgRef.current.d3Force('gravity', (alpha: number) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.nodes.forEach((n: any) => {
              const node = n as NodeObj;
              const pullStrength = overlapOnly
                ? node.group === 'etf'
                  ? 0.02
                  : 0.005
                : node.group === 'etf'
                  ? 0.08
                  : 0.01;
              if (node.vx !== undefined && node.x !== undefined)
                node.vx -= node.x * alpha * pullStrength;
              if (node.vy !== undefined && node.y !== undefined)
                node.vy -= node.y * alpha * pullStrength;
              if (node.vz !== undefined && node.z !== undefined)
                node.vz -= node.z * alpha * pullStrength;
            });
          });
        } catch (e) {
          console.warn('Error tweaking physics', e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data, isHighVolume, isExtremeVolume, overlapOnly, fgRef]);
}

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCameraPersistence(fgRef: React.MutableRefObject<any>) {
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(CAMERA_STORAGE_KEY);
        if (stored && fgRef.current) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.x === 'number') {
            fgRef.current.cameraPosition(parsed, undefined, 2000);
          }
        }
      } catch (e) {
        console.warn('Could not restore camera position for camera_network_graph', e);
      }
    }, 100);

    const savePosition = () => {
      try {
        if (fgRef.current) {
          const pos = fgRef.current.cameraPosition();
          window.localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify(pos));
        }
      } catch {
        // ignore
      }
    };

    const interval = setInterval(savePosition, 1000);
    window.addEventListener('beforeunload', savePosition);

    const handleClear = () => {
      window.localStorage.removeItem(CAMERA_STORAGE_KEY);
    };

    window.addEventListener(CLEAR_UI_EVENT, handleClear);

    return () => {
      clearTimeout(timer);
      savePosition();
      clearInterval(interval);
      window.removeEventListener('beforeunload', savePosition);
      window.removeEventListener(CLEAR_UI_EVENT, handleClear);
    };
  }, [fgRef]);
}

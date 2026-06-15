import { useEffect, useRef } from 'react';

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

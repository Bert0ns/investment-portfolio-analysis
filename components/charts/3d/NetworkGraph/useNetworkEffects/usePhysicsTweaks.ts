import { useEffect } from 'react';
import { NodeObj } from '../types';

function applyPhysicsTweaks(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fg: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  isHighVolume: boolean,
  isExtremeVolume: boolean,
  overlapOnly?: boolean
) {
  try {
    const centerForce = fg.d3Force('center');
    if (centerForce) centerForce.strength(0);

    const chargeForce = fg.d3Force('charge');
    if (chargeForce) {
      chargeForce.strength(overlapOnly ? -300 : isExtremeVolume ? -40 : isHighVolume ? -60 : -100);
    }

    const linkForce = fg.d3Force('link');
    if (linkForce) {
      linkForce.distance(overlapOnly ? 150 : isExtremeVolume ? 50 : isHighVolume ? 70 : 90);
    }

    fg.d3Force('gravity', (alpha: number) => {
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
        if (node.vx !== undefined && node.x !== undefined) node.vx -= node.x * alpha * pullStrength;
        if (node.vy !== undefined && node.y !== undefined) node.vy -= node.y * alpha * pullStrength;
        if (node.vz !== undefined && node.z !== undefined) node.vz -= node.z * alpha * pullStrength;
      });
    });
  } catch (e) {
    console.warn('Error tweaking physics', e);
  }
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
        applyPhysicsTweaks(fgRef.current, data, isHighVolume, isExtremeVolume, overlapOnly);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data, isHighVolume, isExtremeVolume, overlapOnly, fgRef]);
}

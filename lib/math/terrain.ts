import * as THREE from 'three';
import { EtfConfig } from '@/lib/types';

export function calculateTerrainOverlapMatrix(etfs: EtfConfig[]): number[][] {
  const N = etfs.length;
  if (N === 0) return [];

  const matrix = Array.from({ length: N }, () => Array(N).fill(0));

  // Compute holdings maps once to avoid redundant map building
  const holdingsMaps = etfs.map((etf) => {
    const map = new Map<string, number>();
    etf.holdings.forEach((h) => {
      // Normalize weight relative to the ETF itself (so sum is 1)
      map.set(h.ticker, h.weight / 100);
    });
    return map;
  });

  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      if (i === j) {
        matrix[i][j] = 1; // Self overlap is 100%
      } else {
        let overlap = 0;
        const mapA = holdingsMaps[i];
        const mapB = holdingsMaps[j];
        mapA.forEach((weightA, ticker) => {
          if (mapB.has(ticker)) {
            overlap += Math.min(weightA, mapB.get(ticker)!);
          }
        });
        matrix[i][j] = overlap;
      }
    }
  }

  return matrix;
}

// Bilinear interpolation
export function bilerp(c00: number, c10: number, c01: number, c11: number, tx: number, ty: number) {
  return c00 * (1 - tx) * (1 - ty) + c10 * tx * (1 - ty) + c01 * (1 - tx) * ty + c11 * tx * ty;
}

// Smoothstep for more natural curves
export function smoothstep(x: number) {
  return x * x * (3 - 2 * x);
}

export function generateTerrainGeometry(
  overlapMatrix: number[][],
  numEtfs: number,
  planeSize: number = 10,
  segments: number = 64
) {
  const geom = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);
  const posAttribute = geom.attributes.position;

  const colors: number[] = [];
  const color = new THREE.Color();

  for (let i = 0; i < posAttribute.count; i++) {
    const x = posAttribute.getX(i);
    const y = posAttribute.getY(i);

    // Map x, y from [-planeSize/2, planeSize/2] to [0, N-1]
    const nx = (x + planeSize / 2) / planeSize;
    const ny = (y + planeSize / 2) / planeSize;

    let u = nx * (numEtfs - 1);
    let v = ny * (numEtfs - 1);

    if (numEtfs <= 1) {
      u = 0;
      v = 0;
    }

    const u0 = Math.floor(u);
    const u1 = Math.min(u0 + 1, numEtfs - 1);
    const v0 = Math.floor(v);
    const v1 = Math.min(v0 + 1, numEtfs - 1);

    const tx = smoothstep(u - u0);
    const ty = smoothstep(v - v0);

    let height = 0;
    if (numEtfs > 0 && overlapMatrix.length > 0) {
      const c00 = overlapMatrix[v0]?.[u0] || 0;
      const c10 = overlapMatrix[v0]?.[u1] || 0;
      const c01 = overlapMatrix[v1]?.[u0] || 0;
      const c11 = overlapMatrix[v1]?.[u1] || 0;
      height = bilerp(c00, c10, c01, c11, tx, ty);
    }

    // Add some high-frequency noise based on height to make it look like a mountain
    const noise = Math.sin(x * 5) * Math.cos(y * 5) * 0.05 * height;

    const finalHeight = (height + noise) * 3; // Scale Z
    posAttribute.setZ(i, finalHeight);

    // Color mapping: valleys are dark/blue-ish green, peaks are white
    if (height < 0.1) {
      color.setHSL(0.3, 0.5, 0.2 + height);
    } else if (height < 0.5) {
      color.setHSL(0.25, 0.6, 0.2 + height);
    } else if (height < 0.8) {
      color.setHSL(0.1, 0.4, height);
    } else {
      color.setHSL(0, 0, height);
    }
    colors.push(color.r, color.g, color.b);
  }

  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geom.computeVertexNormals();
  return geom;
}

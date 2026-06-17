import {
  calculateTerrainOverlapMatrix,
  bilerp,
  smoothstep,
  generateTerrainGeometry,
} from '../lib/math/terrain';
import { EtfConfig } from '../lib/types';
import * as THREE from 'three';

describe('terrain math utilities', () => {
  describe('bilerp', () => {
    it('performs bilinear interpolation correctly', () => {
      // 4 corners: 0, 10, 20, 30
      // tx=0.5, ty=0.5 -> average = 15
      expect(bilerp(0, 10, 20, 30, 0.5, 0.5)).toBeCloseTo(15);

      // tx=0, ty=0 -> c00
      expect(bilerp(0, 10, 20, 30, 0, 0)).toBe(0);

      // tx=1, ty=1 -> c11
      expect(bilerp(0, 10, 20, 30, 1, 1)).toBe(30);

      // tx=0.5, ty=0 -> mid between c00 and c10
      expect(bilerp(0, 10, 20, 30, 0.5, 0)).toBe(5);
    });
  });

  describe('smoothstep', () => {
    it('applies smoothstep function correctly', () => {
      expect(smoothstep(0)).toBe(0);
      expect(smoothstep(1)).toBe(1);
      expect(smoothstep(0.5)).toBe(0.5);
      expect(smoothstep(0.25)).toBeCloseTo(0.15625);
    });
  });

  describe('calculateTerrainOverlapMatrix', () => {
    it('returns empty array for empty etfs', () => {
      expect(calculateTerrainOverlapMatrix([])).toEqual([]);
    });

    it('calculates overlap matrix correctly for ETFs', () => {
      const etfs: EtfConfig[] = [
        {
          id: '1',
          name: 'ETF 1',
          isin: 'IE001',
          issuer: 'Vanguard',
          ter: 0.1,
          globalWeight: 50,
          replicationMethod: 'Physical',
          useOfProfit: 'Accumulating',
          domicile: 'Ireland',
          fundAge: 5,
          fundSize: 100,
          holdings: [
            { name: 'A', ticker: 'AAPL', weight: 60, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'MSFT', weight: 40, sector: 'IT', country: 'US', currency: 'USD' },
          ],
        },
        {
          id: '2',
          name: 'ETF 2',
          isin: 'IE002',
          issuer: 'Vanguard',
          ter: 0.1,
          globalWeight: 50,
          replicationMethod: 'Physical',
          useOfProfit: 'Accumulating',
          domicile: 'Ireland',
          fundAge: 5,
          fundSize: 100,
          holdings: [
            { name: 'A', ticker: 'AAPL', weight: 30, sector: 'IT', country: 'US', currency: 'USD' },
            { name: 'B', ticker: 'MSFT', weight: 70, sector: 'IT', country: 'US', currency: 'USD' },
          ],
        },
      ];

      const matrix = calculateTerrainOverlapMatrix(etfs);
      expect(matrix).toHaveLength(2);
      expect(matrix[0]).toHaveLength(2);

      // Self overlap should be 1
      expect(matrix[0][0]).toBe(1);
      expect(matrix[1][1]).toBe(1);

      // Overlap between 1 and 2:
      // AAPL min(0.6, 0.3) = 0.3
      // MSFT min(0.4, 0.7) = 0.4
      // Total overlap = 0.7
      expect(matrix[0][1]).toBeCloseTo(0.7);
      expect(matrix[1][0]).toBeCloseTo(0.7);
    });
  });

  describe('generateTerrainGeometry', () => {
    it('generates a THREE.PlaneGeometry with updated Z values', () => {
      const overlapMatrix = [
        [1, 0.5],
        [0.5, 1],
      ];

      const geom = generateTerrainGeometry(overlapMatrix, 2, 10, 4);

      expect(geom).toBeInstanceOf(THREE.PlaneGeometry);

      const pos = geom.attributes.position;
      expect(pos).toBeDefined();
      expect(pos.count).toBeGreaterThan(0);

      const color = geom.attributes.color;
      expect(color).toBeDefined();
      expect(color.count).toBe(pos.count);

      // Test different Z heights (noise makes exact matching hard, but Z should not be exactly 0 everywhere)
      let maxZ = 0;
      for (let i = 0; i < pos.count; i++) {
        if (pos.getZ(i) > maxZ) {
          maxZ = pos.getZ(i);
        }
      }
      expect(maxZ).toBeGreaterThan(0);
    });

    it('handles zero ETFs gracefully', () => {
      const geom = generateTerrainGeometry([], 0, 10, 2);
      expect(geom).toBeInstanceOf(THREE.PlaneGeometry);
      const pos = geom.attributes.position;
      expect(pos.getZ(0)).toBe(0); // Noise with height=0 will be 0
    });

    it('handles one ETF gracefully', () => {
      const geom = generateTerrainGeometry([[1]], 1, 10, 2);
      expect(geom).toBeInstanceOf(THREE.PlaneGeometry);
      // For numEtfs=1, height will be 1 (c00=1) + noise
      const pos = geom.attributes.position;
      expect(pos.getZ(0)).toBeGreaterThan(0);
    });
  });
});

import { VoronoiPolygon } from './voronoi';
import { EtfConfig } from '@/lib/types';

// Global memory cache for Voronoi Treemaps to prevent recomputation on tab switches
const cache = new Map<string, VoronoiPolygon[]>();

export function getVoronoiCacheKey(
  etfs: EtfConfig[],
  width: number,
  height: number,
  maxNodes: number
): string {
  // We hash the ETF IDs, their global weights, and their holding counts to ensure
  // any change in the portfolio structure busts the cache.
  const etfsHash = etfs.map((e) => `${e.id}:${e.globalWeight}:${e.holdings.length}`).join('|');
  // Dimensions are rounded because ResizeObserver can emit fractional pixels
  return `${etfsHash}_${Math.round(width)}x${Math.round(height)}_${maxNodes}`;
}

export function getCachedVoronoi(cacheKey: string): VoronoiPolygon[] | null {
  return cache.get(cacheKey) || null;
}

export function setCachedVoronoi(key: string, data: VoronoiPolygon[]) {
  // Keep memory footprint small by limiting cache to 5 recent computations
  // (Useful if the user is wildly dragging the slider or resizing the window)
  if (cache.size >= 5) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, data);
}

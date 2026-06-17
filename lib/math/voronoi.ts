import { EtfConfig } from '@/lib/types';
import { hierarchy } from 'd3-hierarchy';
import { voronoiTreemap } from 'd3-voronoi-treemap';

export interface VoronoiNodeData {
  id: string;
  name: string;
  ticker: string;
  weight: number;
  sector: string;
  isTail?: boolean;
}

export interface VoronoiPolygon {
  data: VoronoiNodeData;
  polygon: [number, number][];
}

export function generateVoronoiData(
  etfs: EtfConfig[],
  width: number,
  height: number,
  maxNodes: number = 150
): VoronoiPolygon[] {
  if (etfs.length === 0) return [];

  // 1. Aggregate holdings across ETFs
  const holdingsMap = new Map<string, VoronoiNodeData>();

  for (const etf of etfs) {
    const globalMultiplier = etf.globalWeight / 100;
    if (globalMultiplier === 0) continue;

    for (const holding of etf.holdings) {
      const actualWeight = holding.weight * globalMultiplier;
      const key = holding.ticker !== 'N/A' ? holding.ticker : holding.name;

      if (!holdingsMap.has(key)) {
        holdingsMap.set(key, {
          id: key,
          name: holding.name,
          ticker: holding.ticker,
          weight: 0,
          sector: holding.sector || 'Unknown',
        });
      }

      const existing = holdingsMap.get(key)!;
      existing.weight += actualWeight;
    }
  }

  // 2. Sort by weight
  let allHoldings = Array.from(holdingsMap.values()).sort((a, b) => b.weight - a.weight);

  // 3. Cluster tail into a single node
  if (allHoldings.length > maxNodes) {
    const topHoldings = allHoldings.slice(0, maxNodes);
    const tailHoldings = allHoldings.slice(maxNodes);

    const tailWeight = tailHoldings.reduce((sum, h) => sum + h.weight, 0);

    topHoldings.push({
      id: 'TAIL_NODE',
      name: 'TAIL_NAME',
      ticker: 'TAIL_TICKER',
      weight: tailWeight,
      sector: 'TAIL_SECTOR',
      isTail: true,
    });

    allHoldings = topHoldings;
  }

  // 4. Build hierarchy for d3
  const rootData = {
    id: 'root',
    children: allHoldings,
  };

  const rootNode = hierarchy<unknown>(rootData).sum((d) => (d as { weight?: number }).weight || 0);

  // 5. Compute Voronoi treemap
  const vTreemap = voronoiTreemap()
    .maxIterationCount(50)
    .clip([
      [0, 0],
      [width, 0],
      [width, height],
      [0, height],
    ]);

  vTreemap(rootNode);

  // 6. Extract polygons
  const polygons: VoronoiPolygon[] = [];

  const leaves = rootNode.leaves();
  for (const leaf of leaves) {
    const vLeaf = leaf as unknown as { polygon?: [number, number][] };
    if (vLeaf.polygon) {
      polygons.push({
        data: leaf.data as VoronoiNodeData,
        polygon: vLeaf.polygon.map((p: number[]) => [p[0], p[1]] as [number, number]),
      });
    }
  }

  return polygons.sort((a, b) => b.data.weight - a.data.weight);
}

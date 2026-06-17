declare module 'd3-voronoi-treemap' {
  import { HierarchyNode } from 'd3-hierarchy';

  export function voronoiTreemap<Datum>(): VoronoiTreemapLayout<Datum>;

  export interface VoronoiTreemapLayout<Datum> {
    (root: HierarchyNode<Datum>): HierarchyNode<Datum>;
    clip(polygon: [number, number][]): this;
    extent(extent: [[number, number], [number, number]]): this;
    size(size: [number, number]): this;
    convergenceRatio(ratio: number): this;
    maxIterationCount(count: number): this;
    minWeightRatio(ratio: number): this;
    prng(prng: () => number): this;
  }
}

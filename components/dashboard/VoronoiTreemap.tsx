'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { VoronoiPolygon } from '@/lib/math/voronoi';
import { getVoronoiCacheKey, getCachedVoronoi, setCachedVoronoi } from '@/lib/math/voronoiCache';
import { useDebounce } from '@/hooks/useDebounce';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { VoronoiLoader } from './voronoi/VoronoiLoader';
import { VoronoiSvg } from './voronoi/VoronoiSvg';
import { VoronoiTooltip } from './voronoi/VoronoiTooltip';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { ChartTitleWithInfo } from '@/components/charts/Shared';

interface VoronoiTreemapProps {
  etfs: EtfConfig[];
}

export function VoronoiTreemap({ etfs }: VoronoiTreemapProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredCell, setHoveredCell] = useState<VoronoiPolygon | null>(null);

  const totalHoldings = useMemo(() => {
    const keys = new Set<string>();
    etfs.forEach((etf) => {
      if (etf.globalWeight > 0) {
        etf.holdings.forEach((h) => {
          keys.add(h.ticker !== 'N/A' ? h.ticker : h.name);
        });
      }
    });
    return keys.size;
  }, [etfs]);

  const [maxNodes, setMaxNodes] = useLocalStorage('voronoi_max_nodes', 150);
  const debouncedMaxNodes = useDebounce(maxNodes, 300);
  const [polygons, setPolygons] = useState<VoronoiPolygon[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    observer.observe(containerRef.current);

    // Initialize Web Worker
    workerRef.current = new Worker(new URL('../../lib/math/voronoi.worker.ts', import.meta.url));
    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'SUCCESS') {
        setPolygons(e.data.polygons);
        setCachedVoronoi(e.data.cacheKey, e.data.polygons);
        setIsCalculating(false);
      } else if (e.data.type === 'ERROR') {
        console.error('Voronoi Worker Error:', e.data.error);
        setIsCalculating(false);
      }
    };

    return () => {
      observer.disconnect();
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || etfs.length === 0) return;

    const cacheKey = getVoronoiCacheKey(
      etfs,
      dimensions.width,
      dimensions.height,
      debouncedMaxNodes
    );
    const cachedData = getCachedVoronoi(cacheKey);

    if (cachedData) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setPolygons(cachedData);
      setIsCalculating(false);
      /* eslint-enable react-hooks/set-state-in-effect */
      return;
    }

    setIsCalculating(true);
    workerRef.current?.postMessage({
      etfs,
      width: dimensions.width,
      height: dimensions.height,
      maxNodes: debouncedMaxNodes,
      cacheKey,
    });
  }, [etfs, dimensions, debouncedMaxNodes]);

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 pb-2">
        <ChartTitleWithInfo
          title={t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTitle}
          info={t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiInfo}
        />
        <div className="flex flex-col items-end gap-1 w-48">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiNodesSliderLabel}:{' '}
            <span className="font-mono text-primary font-bold">{maxNodes}</span>
          </span>
          <Slider
            defaultValue={[Math.min(150, Math.max(10, totalHoldings))]}
            max={Math.max(10, totalHoldings)}
            min={2}
            step={50}
            value={[maxNodes]}
            onValueChange={(val) => setMaxNodes(Array.isArray(val) ? val[0] : val)}
            className="w-full"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full h-125 relative">
          <VoronoiLoader isCalculating={isCalculating} />
          <VoronoiSvg
            dimensions={dimensions}
            polygons={polygons}
            hoveredCell={hoveredCell}
            setHoveredCell={setHoveredCell}
          />
          {hoveredCell && <VoronoiTooltip hoveredCell={hoveredCell} />}
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { EtfConfig } from '@/lib/types';
import { generateVoronoiData, VoronoiPolygon } from '@/lib/math/voronoi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useTranslation } from '@/lib/i18n/LanguageContext';

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

  const [maxNodes, setMaxNodes] = useState(150);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const polygons = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || etfs.length === 0) return [];
    try {
      return generateVoronoiData(etfs, dimensions.width, dimensions.height, maxNodes, {
        name: t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailName,
        ticker: t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailTicker,
        sector: t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailSector,
      });
    } catch (err) {
      console.error('Error generating Voronoi treemap', err);
      return [];
    }
  }, [etfs, dimensions, maxNodes, t.pages.analyzer.dashboard.tabs.fundDetailsTab]);

  // Cyberpunk/Neon Color palette based on sectors
  const getColor = (sector: string, isTail?: boolean) => {
    if (isTail) return 'rgba(128, 128, 128, 0.1)';

    // A sober but neon palette
    const colors = [
      'rgba(56, 189, 248, 0.2)', // Light Blue
      'rgba(167, 139, 250, 0.2)', // Purple
      'rgba(251, 146, 60, 0.2)', // Orange
      'rgba(52, 211, 153, 0.2)', // Emerald
      'rgba(244, 114, 182, 0.2)', // Pink
      'rgba(250, 204, 21, 0.2)', // Yellow
    ];

    // Simple hash to consistently pick a color
    let hash = 0;
    for (let i = 0; i < sector.length; i++) {
      hash = sector.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getBorderColor = (sector: string, isTail?: boolean) => {
    if (isTail) return 'rgba(128, 128, 128, 0.3)';

    const colors = [
      'rgb(56, 189, 248)',
      'rgb(167, 139, 250)',
      'rgb(251, 146, 60)',
      'rgb(52, 211, 153)',
      'rgb(244, 114, 182)',
      'rgb(250, 204, 21)',
    ];
    let hash = 0;
    for (let i = 0; i < sector.length; i++) {
      hash = sector.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Card className="w-full relative overflow-hidden bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            {t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTitle}
          </CardTitle>
          <CardDescription>
            {t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiInfo}
          </CardDescription>
        </div>
        <div className="flex flex-col items-end gap-1 w-48">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiNodesSliderLabel}:{' '}
            <span className="font-mono text-primary font-bold">{maxNodes}</span>
          </span>
          <Slider
            defaultValue={[Math.min(150, Math.max(10, totalHoldings))]}
            max={Math.max(10, totalHoldings)}
            min={10}
            step={10}
            value={[maxNodes]}
            onValueChange={(val) => setMaxNodes(Array.isArray(val) ? val[0] : val)}
            className="w-full"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="w-full h-[500px] relative">
          {dimensions.width > 0 && dimensions.height > 0 && polygons.length > 0 && (
            <svg
              width={dimensions.width}
              height={dimensions.height}
              className="absolute inset-0"
              style={{ filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.5))' }}
            >
              <defs>
                {/* Glow filter for hover state */}
                <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {polygons.map((cell, i) => {
                const pathData = `M${cell.polygon.map((p) => p.join(',')).join('L')}Z`;
                const isHovered = hoveredCell?.data.id === cell.data.id;
                const strokeColor = getBorderColor(cell.data.sector, cell.data.isTail);
                const fillColor = getColor(cell.data.sector, cell.data.isTail);

                return (
                  <motion.path
                    key={cell.data.id}
                    d={pathData}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.005, // staggered entry
                      ease: 'easeOut',
                    }}
                    fill={isHovered ? strokeColor : fillColor}
                    stroke={strokeColor}
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-colors duration-300"
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    style={isHovered ? { filter: 'url(#neon-glow)' } : {}}
                  />
                );
              })}
            </svg>
          )}

          {/* Hover Tooltip Overlay */}
          {hoveredCell && (
            <div
              className="absolute top-4 right-4 pointer-events-none bg-background/90 border border-primary/40 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md max-w-[250px]"
              style={{
                boxShadow: `0 0 10px ${getBorderColor(hoveredCell.data.sector, hoveredCell.data.isTail)}33`,
              }}
            >
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                {hoveredCell.data.sector}
              </div>
              <div className="font-bold text-lg leading-tight mb-1">{hoveredCell.data.name}</div>
              <div className="flex justify-between items-center mt-3">
                <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-mono">
                  {hoveredCell.data.ticker}
                </span>
                <span className="font-mono text-sm font-semibold">
                  {hoveredCell.data.weight.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

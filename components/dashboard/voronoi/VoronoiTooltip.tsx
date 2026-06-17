import React from 'react';
import { VoronoiPolygon } from '@/lib/math/voronoi';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { getVoronoiBorderColor } from './colors';

interface VoronoiTooltipProps {
  hoveredCell: VoronoiPolygon;
}

export function VoronoiTooltip({ hoveredCell }: VoronoiTooltipProps) {
  const { t } = useTranslation();
  const { isTail, sector, name, ticker, weight } = hoveredCell.data;

  return (
    <div
      className="absolute top-4 right-4 pointer-events-none bg-background/90 border border-primary/40 p-4 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md max-w-62.5"
      style={{
        boxShadow: `0 0 10px ${getVoronoiBorderColor(sector, isTail)}33`,
      }}
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
        {isTail ? t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailSector : sector}
      </div>
      <div className="font-bold text-lg leading-tight mb-1">
        {isTail ? t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailName : name}
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded font-mono">
          {isTail ? t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiTailTicker : ticker}
        </span>
        <span className="font-mono text-sm font-semibold">{weight.toFixed(2)}%</span>
      </div>
    </div>
  );
}

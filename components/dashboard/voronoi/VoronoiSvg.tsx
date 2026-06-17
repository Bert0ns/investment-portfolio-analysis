import React from 'react';
import { motion } from 'framer-motion';
import { VoronoiPolygon } from '@/lib/math/voronoi';
import { getVoronoiColor, getVoronoiBorderColor } from './colors';

interface VoronoiSvgProps {
  dimensions: { width: number; height: number };
  polygons: VoronoiPolygon[];
  hoveredCell: VoronoiPolygon | null;
  setHoveredCell: (cell: VoronoiPolygon | null) => void;
}

export function VoronoiSvg({ dimensions, polygons, hoveredCell, setHoveredCell }: VoronoiSvgProps) {
  if (dimensions.width === 0 || dimensions.height === 0 || polygons.length === 0) {
    return null;
  }

  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0"
    >
      <defs>
        {/* Glow filter for hover state only */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {polygons.map((cell) => {
        const pathData = `M${cell.polygon.map((p) => p.join(',')).join('L')}Z`;
        const isHovered = hoveredCell?.data.id === cell.data.id;
        const strokeColor = getVoronoiBorderColor(cell.data.sector, cell.data.isTail);
        const fillColor = getVoronoiColor(cell.data.sector, cell.data.isTail);

        return (
          <path
            key={cell.data.id}
            d={pathData}
            fill={isHovered ? strokeColor : fillColor}
            stroke={strokeColor}
            strokeWidth={isHovered ? 2 : 1}
            className="cursor-pointer transition-colors duration-200"
            onMouseEnter={() => setHoveredCell(cell)}
            onMouseLeave={() => setHoveredCell(null)}
            style={isHovered ? { filter: 'url(#neon-glow)' } : {}}
          />
        );
      })}
    </motion.svg>
  );
}

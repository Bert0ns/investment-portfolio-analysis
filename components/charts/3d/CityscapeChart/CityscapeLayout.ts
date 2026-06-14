import { EtfConfig } from '@/lib/types';
import { normalizeSector } from '@/lib/math';

export interface HoldingData {
  name: string;
  value: number;
}

export interface SectorGroup {
  name: string;
  value: number;
  children: HoldingData[];
}

export interface PlacedBuilding {
  name: string;
  value: number;
  sector: string;
  color: string;
  x: number;
  y: number;
  size: number;
  depth: number;
  isLargest?: boolean;
}

export interface CityscapeData {
  buildings: PlacedBuilding[];
  districtPlanes: { x: number; y: number; size: number; color: string; name: string }[];
  totalWidth: number;
  totalHeight: number;
}

const SECTOR_COLORS: Record<string, string> = {
  'Information Technology': '#22d3ee', // cyan
  IT: '#22d3ee',
  Tecnologia: '#22d3ee',
  Financials: '#3b82f6', // blue
  Finanza: '#3b82f6',
  'Health Care': '#f472b6', // pink
  Salute: '#f472b6',
  Healthcare: '#f472b6',
  'Consumer Discretionary': '#f59e0b', // amber
  'Beni voluttuari': '#f59e0b',
  Industrials: '#64748b', // slate
  Industria: '#64748b',
  'Consumer Staples': '#10b981', // emerald
  'Beni di prima necessità': '#10b981',
  Energy: '#ef4444', // red
  Energia: '#ef4444',
  Utilities: '#8b5cf6', // violet
  'Real Estate': '#14b8a6', // teal
  Immobiliare: '#14b8a6',
  Materials: '#84cc16', // lime
  Materiali: '#84cc16',
  'Communication Services': '#d946ef', // fuchsia
  Telecomunicazioni: '#d946ef',
  Unknown: '#71717a',
};

export function getSectorColor(sector: string): string {
  if (SECTOR_COLORS[sector]) return SECTOR_COLORS[sector];
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = sector.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${Math.abs(hash) % 360}, 80%, 50%)`;
}

function buildSectorGroups(etfs: EtfConfig[]): SectorGroup[] {
  const holdingMap = new Map<string, { name: string; sector: string; value: number }>();

  etfs
    .filter((e) => e.globalWeight > 0)
    .forEach((etf) => {
      const etfWeight = etf.globalWeight;
      etf.holdings.forEach((h) => {
        const normalizedSector = normalizeSector(h.sector);
        const key = `${normalizedSector}-${h.name || h.ticker}`;
        const absWeight = (h.weight / 100) * etfWeight;

        if (!holdingMap.has(key)) {
          holdingMap.set(key, {
            name: h.name || h.ticker,
            sector: normalizedSector || 'Unknown',
            value: 0,
          });
        }
        holdingMap.get(key)!.value += absWeight;
      });
    });

  const sectorMap = new Map<string, SectorGroup>();
  for (const h of holdingMap.values()) {
    if (!sectorMap.has(h.sector)) {
      sectorMap.set(h.sector, { name: h.sector, value: 0, children: [] });
    }
    const group = sectorMap.get(h.sector)!;
    group.value += h.value;
    group.children.push({ name: h.name, value: h.value });
  }

  const sectors = Array.from(sectorMap.values());
  sectors.sort((a, b) => {
    const maxA = a.children.length > 0 ? Math.max(...a.children.map((c) => c.value)) : 0;
    const maxB = b.children.length > 0 ? Math.max(...b.children.map((c) => c.value)) : 0;
    return maxB - maxA;
  });

  return sectors;
}

function isColliding(
  x: number,
  y: number,
  size: number,
  placed: PlacedBuilding[],
  gap: number
): boolean {
  for (const pb of placed) {
    const minDistanceX = (size + pb.size) / 2 + gap;
    const minDistanceY = (size + pb.size) / 2 + gap;
    if (Math.abs(x - pb.x) < minDistanceX && Math.abs(y - pb.y) < minDistanceY) {
      return true;
    }
  }
  return false;
}

function packBuildingsInSector(
  sector: SectorGroup,
  centerX: number,
  centerY: number,
  districtSize: number
): PlacedBuilding[] {
  const placedBuildings: PlacedBuilding[] = [];
  const sectorColor = getSectorColor(sector.name);
  const children = [...sector.children].sort((a, b) => b.value - a.value);

  for (const child of children) {
    const areaShare = (child.value / sector.value) * (districtSize * districtSize) * 0.45;
    const size = Math.max(0.05, Math.min(Math.sqrt(areaShare), 3.0));
    const depth = Math.max(0.1, Math.pow(child.value, 0.85) * 10);
    const GAP = Math.max(0.05, size * 0.15);
    let angle = 0;

    while (angle < 1000) {
      const radius = 0.15 * angle;
      const localX = Math.cos(angle) * radius;
      const localY = Math.sin(angle) * radius;
      const globalX = centerX + localX;
      const globalY = centerY + localY;

      if (
        Math.abs(localX) + size / 2 <= districtSize / 2 - 0.2 &&
        Math.abs(localY) + size / 2 <= districtSize / 2 - 0.2 &&
        !isColliding(globalX, globalY, size, placedBuildings, GAP)
      ) {
        placedBuildings.push({
          name: child.name,
          value: child.value,
          sector: sector.name,
          color: sectorColor,
          x: globalX,
          y: globalY,
          size,
          depth,
          isLargest: placedBuildings.length === 0,
        });
        break;
      }
      angle += 0.5;
    }
  }
  return placedBuildings;
}

export function layoutCityscape(etfs: EtfConfig[]): CityscapeData {
  const sectors = buildSectorGroups(etfs);

  const cols = Math.ceil(Math.sqrt(sectors.length));
  const DISTRICT_SIZE = 14;
  const ROAD_WIDTH = 2.5;

  const totalWidth = cols * DISTRICT_SIZE + (cols - 1) * ROAD_WIDTH;
  const rows = Math.ceil(sectors.length / cols);
  const totalHeight = rows * DISTRICT_SIZE + (rows - 1) * ROAD_WIDTH;

  const positions: { x: number; y: number; distance: number }[] = [];
  for (let i = 0; i < sectors.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const centerX = col * (DISTRICT_SIZE + ROAD_WIDTH) - totalWidth / 2 + DISTRICT_SIZE / 2;
    const centerY = row * (DISTRICT_SIZE + ROAD_WIDTH) - totalHeight / 2 + DISTRICT_SIZE / 2;
    positions.push({
      x: centerX,
      y: centerY,
      distance: Math.sqrt(centerX * centerX + centerY * centerY),
    });
  }
  positions.sort((a, b) => a.distance - b.distance);

  const buildings: PlacedBuilding[] = [];
  const districtPlanes = sectors.map((sector, index) => {
    const { x: centerX, y: centerY } = positions[index];
    const sectorColor = getSectorColor(sector.name);

    const sectorBuildings = packBuildingsInSector(sector, centerX, centerY, DISTRICT_SIZE);
    buildings.push(...sectorBuildings);

    return { x: centerX, y: centerY, size: DISTRICT_SIZE, color: sectorColor, name: sector.name };
  });

  return { buildings, districtPlanes, totalWidth, totalHeight };
}

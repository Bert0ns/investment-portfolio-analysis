import { PlacedBuilding } from '@/components/charts/3d/CityscapeChart/CityscapeLayout';

interface HoveringTooltipOverlayProps {
  hoveredBuilding: PlacedBuilding;
}

export function HoveringTooltipOverlay({ hoveredBuilding }: HoveringTooltipOverlayProps) {
  return (
    <div className="absolute top-4 right-4 pointer-events-none bg-popover/80 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-lg flex flex-col gap-1 min-w-40 text-popover-foreground">
      <p className="text-xs font-bold truncate max-w-40">{hoveredBuilding.name}</p>
      <p className="text-[10px] text-muted-foreground uppercase">{hoveredBuilding.sector}</p>
      <p className="text-lg font-mono text-primary mt-1">{hoveredBuilding.value.toFixed(2)}%</p>
    </div>
  );
}

import React from 'react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MapControlsProps {
  zoomIn: () => void;
  zoomOut: () => void;
  resetTransform: () => void;
}

export function MapControls({ zoomIn, zoomOut, resetTransform }: MapControlsProps) {
  return (
    <div className="absolute top-0 right-4 z-20 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-lg border border-border shadow-sm">
      <button
        onClick={() => zoomIn()}
        className="p-1.5 hover:bg-muted rounded-md transition-colors"
        title="Zoom In"
      >
        <ZoomIn className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={() => zoomOut()}
        className="p-1.5 hover:bg-muted rounded-md transition-colors"
        title="Zoom Out"
      >
        <ZoomOut className="w-4 h-4 text-foreground" />
      </button>
      <button
        onClick={() => resetTransform()}
        className="p-1.5 hover:bg-muted rounded-md transition-colors"
        title="Reset View"
      >
        <Maximize className="w-4 h-4 text-foreground" />
      </button>
    </div>
  );
}

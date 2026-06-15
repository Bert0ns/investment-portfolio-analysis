import React from 'react';
import { Play, Pause } from 'lucide-react';

export const RotationControls = ({
  isRotating,
  onToggle,
  t,
}: {
  isRotating: boolean;
  onToggle: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) => (
  <button
    onClick={onToggle}
    className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
  >
    {isRotating ? <Pause size={14} /> : <Play size={14} />}
    {isRotating ? t.threeDVisuals.pauseRotation : t.threeDVisuals.resumeRotation}
  </button>
);

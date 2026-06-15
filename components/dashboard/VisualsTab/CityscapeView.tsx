import React from 'react';
import { EtfConfig } from '@/lib/types';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { RotationControls } from './RotationControls';

const Cityscape = dynamic(
  () => import('@/components/charts/3d/CityscapeChart/Cityscape').then((mod) => mod.Cityscape),
  {
    ssr: false,
    loading: () => <div className="h-150 bg-card animate-pulse border border-border" />,
  }
);

export function CityscapeView({
  etfs,
  isActive,
  globeRotating,
  setGlobeRotating,
  t,
}: {
  etfs: EtfConfig[];
  isActive: boolean;
  globeRotating: boolean;
  setGlobeRotating: (r: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
        <div className="flex flex-col gap-2 min-w-35">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
            {t.threeDVisuals.treemapCity}
          </Label>
          <span className="text-sm font-medium text-amber-500">
            {etfs.reduce((acc, etf) => acc + (etf.globalWeight > 0 ? etf.holdings.length : 0), 0)}{' '}
            {t.threeDVisuals.holdingsRendered}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <RotationControls
            isRotating={globeRotating}
            onToggle={() => setGlobeRotating(!globeRotating)}
            t={t}
          />
        </div>
      </div>
      {isActive && <Cityscape etfs={etfs} isRotating={globeRotating} />}
    </div>
  );
}

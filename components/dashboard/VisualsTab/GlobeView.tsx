import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut } from 'lucide-react';
import dynamic from 'next/dynamic';
import { BASE_COORDINATES, ALIASES } from '@/lib/utils/Coordinates';
import type { ExposureGlobeRef } from '@/components/charts/3d/GlobeExpusureChart/ExposureGlobe';
import { RotationControls } from './RotationControls';

const ExposureGlobe = dynamic(
  () =>
    import('@/components/charts/3d/GlobeExpusureChart/ExposureGlobe').then(
      (mod) => mod.ExposureGlobe
    ),
  {
    ssr: false,
    loading: () => <div className="h-150 bg-card animate-pulse border border-border" />,
  }
);

export function GlobeView({
  geoData,
  isActive,
  globeRotating,
  setGlobeRotating,
  t,
}: {
  geoData: { name: string; value: number }[];
  isActive: boolean;
  globeRotating: boolean;
  setGlobeRotating: (r: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const globeRef = useRef<ExposureGlobeRef>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
        <div className="flex flex-col gap-2 min-w-35">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
            {t.threeDVisuals.regionsActive}
          </Label>
          <span className="text-sm font-medium text-amber-500">
            {
              new Set(
                geoData
                  .map((d) => ALIASES[d.name.trim()] || d.name.trim())
                  .filter(
                    (name) =>
                      name !== 'Unknown' && name !== 'Unione Europea' && BASE_COORDINATES[name]
                  )
              ).size
            }
          </span>
        </div>

        <div className="flex items-center gap-4">
          <RotationControls
            isRotating={globeRotating}
            onToggle={() => setGlobeRotating(!globeRotating)}
            t={t}
          />
          <div className="flex gap-2">
            <button
              onClick={() => globeRef.current?.zoomIn()}
              className="flex justify-center items-center p-2 bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => globeRef.current?.zoomOut()}
              className="flex justify-center items-center p-2 bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
          </div>
        </div>
      </div>
      {isActive && <ExposureGlobe ref={globeRef} data={geoData} isRotating={globeRotating} />}
    </div>
  );
}

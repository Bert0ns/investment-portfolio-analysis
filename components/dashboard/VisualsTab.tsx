import React, { useMemo, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Maximize2, Minimize2, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';
import dynamic from 'next/dynamic';
import { BASE_COORDINATES, ALIASES } from '@/lib/utils/Coordinates';
import type { ExposureGlobeRef } from '@/components/charts/3d/GlobeExpusureChart/ExposureGlobe';

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

const NetworkGraph = dynamic(
  () => import('@/components/charts/3d/NetworkGraph').then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => <div className="h-150 bg-card animate-pulse border border-border" />,
  }
);

const Cityscape = dynamic(
  () => import('@/components/charts/3d/CityscapeChart/Cityscape').then((mod) => mod.Cityscape),
  {
    ssr: false,
    loading: () => <div className="h-150 bg-card animate-pulse border border-border" />,
  }
);

interface VisualsTabProps {
  etfs: EtfConfig[];
  geoData: { name: string; value: number }[];
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isActive?: boolean;
}

export function VisualsTab({
  etfs,
  geoData,
  isFullscreen,
  onToggleFullscreen,
  isActive = true,
}: VisualsTabProps) {
  const { t } = useTranslation();
  const [active3DVisual, setActive3DVisual] = useLocalStorage<'Globe' | 'Network' | 'City'>(
    'visuals_active',
    'Globe'
  );

  // Globe controls state
  const [globeRotating, setGlobeRotating] = useLocalStorage('visuals_globe_rotating', true);
  const globeRef = useRef<ExposureGlobeRef>(null);

  // Network Graph controls state
  const [networkLimit, setNetworkLimit] = useLocalStorage<number[]>('visuals_network_limit', [100]);
  const [networkLivePhysics, setNetworkLivePhysics] = useLocalStorage(
    'visuals_network_physics',
    false
  );
  const [networkOverlapOnly, setNetworkOverlapOnly] = useLocalStorage(
    'visuals_network_overlap',
    false
  );

  const maxHoldings = useMemo(() => {
    const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
    const unique = new Set();
    for (const etf of activeEtfs) {
      for (const h of etf.holdings) {
        unique.add(h.ticker !== 'N/A' ? h.ticker : h.name);
      }
    }
    return Math.max(10, unique.size);
  }, [etfs]);

  return (
    <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 animate-in fade-in bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex justify-end mb-4 gap-3">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActive3DVisual('Globe')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Globe' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t.overviewTab.exposureGlobe}
          </button>
          <button
            onClick={() => setActive3DVisual('Network')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Network' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t.overviewTab.concentrationNetwork}
          </button>
          <button
            onClick={() => setActive3DVisual('City')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'City' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t.threeDVisuals.treemapCity}
          </button>
        </div>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors border border-border hover:border-primary/30 flex items-center justify-center"
            title={isFullscreen ? t.threeDVisuals.exitFullscreen : t.threeDVisuals.fullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
      </div>
      {active3DVisual === 'Globe' ? (
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
              <button
                onClick={() => setGlobeRotating(!globeRotating)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
              >
                {globeRotating ? <Pause size={14} /> : <Play size={14} />}
                {globeRotating ? t.threeDVisuals.pauseRotation : t.threeDVisuals.resumeRotation}
              </button>
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
      ) : active3DVisual === 'Network' ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                  {t.overviewTab.topHoldingsRendered}
                </Label>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {networkLimit[0] >= maxHoldings ? t.threeDVisuals.all : networkLimit[0]}
                </span>
              </div>
              <Slider
                value={networkLimit}
                onValueChange={(val) => setNetworkLimit(Array.isArray(val) ? [...val] : [val])}
                max={maxHoldings}
                min={10}
                step={10}
                className="py-2"
              />
            </div>
            <div className="flex flex-col gap-2 min-w-35">
              <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                {t.threeDVisuals.displayMode}
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Switch
                  id="overlap-mode"
                  checked={networkOverlapOnly}
                  onCheckedChange={setNetworkOverlapOnly}
                />
                <Label
                  htmlFor="overlap-mode"
                  className="text-xs text-muted-foreground cursor-pointer font-medium"
                >
                  {t.threeDVisuals.overlapOnly}
                </Label>
              </div>
            </div>
            <div className="flex flex-col gap-2 min-w-37.5">
              <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                {t.overviewTab.concentrationPhysics}
              </Label>
              <div className="flex items-center space-x-2 mt-1">
                <Switch
                  id="physics-mode"
                  checked={networkLivePhysics}
                  onCheckedChange={setNetworkLivePhysics}
                />
                <Label
                  htmlFor="physics-mode"
                  className="text-xs text-muted-foreground cursor-pointer font-medium"
                >
                  {t.overviewTab.livePhysics}
                </Label>
              </div>
            </div>
          </div>
          {isActive && (
            <NetworkGraph
              etfs={etfs}
              limit={networkLimit}
              livePhysics={networkLivePhysics}
              overlapOnly={networkOverlapOnly}
            />
          )}
        </div>
      ) : active3DVisual === 'City' ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
            <div className="flex flex-col gap-2 min-w-35">
              <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                {t.threeDVisuals.treemapCity}
              </Label>
              <span className="text-sm font-medium text-amber-500">
                {etfs.reduce(
                  (acc, etf) => acc + (etf.globalWeight > 0 ? etf.holdings.length : 0),
                  0
                )}{' '}
                {t.threeDVisuals.holdingsRendered}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setGlobeRotating(!globeRotating)}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-background hover:bg-muted text-foreground rounded-lg transition-colors border border-border"
              >
                {globeRotating ? <Pause size={14} /> : <Play size={14} />}
                {globeRotating ? t.threeDVisuals.pauseRotation : t.threeDVisuals.resumeRotation}
              </button>
            </div>
          </div>
          {isActive && <Cityscape etfs={etfs} isRotating={globeRotating} />}
        </div>
      ) : null}
    </div>
  );
}

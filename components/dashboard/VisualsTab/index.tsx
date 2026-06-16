import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { Maximize2, Minimize2 } from 'lucide-react';

import { GlobeView } from './GlobeView';
import { NetworkView } from './NetworkView';
import { CityscapeView } from './CityscapeView';
import { TerrainView } from './TerrainView';
import { MoneyFlowView } from './MoneyFlowView';

export interface VisualsTabProps {
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
  const [active3DVisual, setActive3DVisual] = useLocalStorage<
    'Globe' | 'Network' | 'City' | 'Terrain' | 'MoneyFlow'
  >('visuals_active', 'Globe');

  // Globe & Cityscape controls state
  const [globeRotating, setGlobeRotating] = useLocalStorage('visuals_globe_rotating', true);

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

  return (
    <div className="lg:col-span-2 transition-transform hover:scale-[1.01] duration-300 animate-in fade-in bg-card border border-border rounded-xl p-4 shadow-sm">
      <div className="flex justify-end mb-4 gap-3 overflow-x-auto scrollbar-none pb-1">
        <div className="bg-muted p-1 rounded-lg inline-flex shrink-0">
          <button
            onClick={() => setActive3DVisual('Globe')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Globe' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.overviewTab.exposureGlobe}
          </button>
          <button
            onClick={() => setActive3DVisual('Network')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Network' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.overviewTab.concentrationNetwork}
          </button>
          <button
            onClick={() => setActive3DVisual('City')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'City' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.threeDVisuals.treemapCity}
          </button>
          <button
            onClick={() => setActive3DVisual('Terrain')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'Terrain' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.threeDVisuals.terrainMap}
          </button>
          <button
            onClick={() => setActive3DVisual('MoneyFlow')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${active3DVisual === 'MoneyFlow' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.threeDVisuals.moneyFlow || 'MoneyFlow'}
          </button>
        </div>
        {onToggleFullscreen && (
          <button
            onClick={onToggleFullscreen}
            className="p-2 bg-muted/50 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-colors border border-border hover:border-primary/30 flex items-center justify-center shrink-0"
            title={isFullscreen ? t.threeDVisuals.exitFullscreen : t.threeDVisuals.fullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        )}
      </div>

      {active3DVisual === 'Globe' ? (
        <GlobeView
          geoData={geoData}
          isActive={isActive}
          globeRotating={globeRotating}
          setGlobeRotating={setGlobeRotating}
          t={t}
        />
      ) : active3DVisual === 'Network' ? (
        <NetworkView
          etfs={etfs}
          isActive={isActive}
          networkLimit={networkLimit}
          setNetworkLimit={setNetworkLimit}
          networkLivePhysics={networkLivePhysics}
          setNetworkLivePhysics={setNetworkLivePhysics}
          networkOverlapOnly={networkOverlapOnly}
          setNetworkOverlapOnly={setNetworkOverlapOnly}
          t={t}
        />
      ) : active3DVisual === 'City' ? (
        <CityscapeView
          etfs={etfs}
          isActive={isActive}
          globeRotating={globeRotating}
          setGlobeRotating={setGlobeRotating}
          t={t}
        />
      ) : active3DVisual === 'Terrain' ? (
        <TerrainView
          etfs={etfs}
          isActive={isActive}
          globeRotating={globeRotating}
          setGlobeRotating={setGlobeRotating}
          t={t}
        />
      ) : active3DVisual === 'MoneyFlow' ? (
        <MoneyFlowView
          etfs={etfs}
          isActive={isActive}
          globeRotating={globeRotating}
          setGlobeRotating={setGlobeRotating}
          t={t}
        />
      ) : null}
    </div>
  );
}

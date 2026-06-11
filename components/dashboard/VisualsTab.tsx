import React, { useState, useMemo } from 'react';
import { EtfConfig } from '../../lib/types';
import { useTranslation } from '../../lib/i18n/LanguageContext';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import dynamic from 'next/dynamic';

const ExposureGlobe = dynamic(
  () => import('../charts/ExposureGlobe').then((mod) => mod.ExposureGlobe),
  {
    ssr: false,
    loading: () => <div className="h-112.5 bg-card animate-pulse border border-border" />,
  }
);

const NetworkGraph = dynamic(
  () => import('../charts/NetworkGraph').then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => <div className="h-112.5 bg-card animate-pulse border border-border" />,
  }
);

interface VisualsTabProps {
  etfs: EtfConfig[];
  geoData: { name: string; value: number }[];
}

export function VisualsTab({ etfs, geoData }: VisualsTabProps) {
  const { t } = useTranslation();
  const [active3DVisual, setActive3DVisual] = useState<'Globe' | 'Network'>('Globe');
  const [networkLimit, setNetworkLimit] = useState<number[]>([100]);
  const [networkLivePhysics, setNetworkLivePhysics] = useState(false);

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
      <div className="flex justify-end mb-4">
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
        </div>
      </div>
      {active3DVisual === 'Globe' ? (
        <ExposureGlobe data={geoData} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
                  {t.overviewTab.topHoldingsRendered}
                </Label>
                <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  {networkLimit[0] >= maxHoldings ? 'ALL' : networkLimit[0]}
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
          <NetworkGraph etfs={etfs} limit={networkLimit} livePhysics={networkLivePhysics} />
        </div>
      )}
    </div>
  );
}

import React, { useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import dynamic from 'next/dynamic';

const NetworkGraph = dynamic(
  () => import('@/components/charts/3d/NetworkGraph').then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => <div className="h-150 bg-card animate-pulse border border-border" />,
  }
);

export function NetworkView({
  etfs,
  isActive,
  networkLimit,
  setNetworkLimit,
  networkLivePhysics,
  setNetworkLivePhysics,
  networkOverlapOnly,
  setNetworkOverlapOnly,
  t,
}: {
  etfs: EtfConfig[];
  isActive: boolean;
  networkLimit: number[];
  setNetworkLimit: (l: number[]) => void;
  networkLivePhysics: boolean;
  setNetworkLivePhysics: (b: boolean) => void;
  networkOverlapOnly: boolean;
  setNetworkOverlapOnly: (b: boolean) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
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
  );
}

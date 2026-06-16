import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import dynamic from 'next/dynamic';
import { EtfConfig } from '@/lib/types';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RotationControls } from './RotationControls';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center p-8 text-red-500 bg-background/50">
          <h2 className="text-xl font-bold mb-4">MoneyFlow Crashed</h2>
          <pre className="text-xs bg-red-500/10 p-4 rounded-md overflow-auto max-w-full max-h-full whitespace-pre-wrap">
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// Dynamically import the 3D MoneyFlow chart to avoid SSR issues
const MoneyFlow = dynamic(
  () => import('@/components/charts/3d/MoneyFlowChart/MoneyFlow').then((mod) => mod.MoneyFlow),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] w-full bg-card animate-pulse border border-border rounded-lg" />
    ),
  }
);

export function MoneyFlowView({
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
  const [topHoldingsCount, setTopHoldingsCount] = useLocalStorage<number[]>(
    'visuals_moneyflow_limit',
    [30]
  );
  const [ctrlPressed, setCtrlPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) setCtrlPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) setCtrlPressed(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Also listen to wheel events to prevent default page scrolling if Ctrl is pressed over the canvas?
    // Not necessary if the user just wants the zoom to work only when ctrl is pressed.

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row justify-between gap-6 p-4 bg-muted/30 rounded-lg border border-border items-center">
        <div className="flex flex-col gap-2 min-w-35">
          <Label className="text-xs font-bold uppercase tracking-widest text-foreground">
            {t.threeDVisuals.moneyFlowTitle}
          </Label>
          <span className="text-sm font-medium text-amber-500">
            {t.threeDVisuals.moneyFlowDescription}
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-foreground font-mono mr-1">
              {t.threeDVisuals.leftClick}
            </kbd>{' '}
            {t.threeDVisuals.pan}
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-foreground font-mono ml-3 mr-1">
              {t.threeDVisuals.rightClick}
            </kbd>{' '}
            {t.threeDVisuals.rotate}
            <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-foreground font-mono ml-3 mr-1">
              {t.threeDVisuals.ctrlScroll}
            </kbd>{' '}
            {t.threeDVisuals.zoom}
          </span>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col gap-2 flex-1 md:w-48">
            <div className="flex justify-between items-center">
              <Label className="text-xs text-muted-foreground">
                {t.threeDVisuals.holdingsVolume}
              </Label>
              <span className="text-xs font-mono">{topHoldingsCount[0]}</span>
            </div>
            <Slider
              value={topHoldingsCount}
              onValueChange={(val) => setTopHoldingsCount(Array.isArray(val) ? val : [val])}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          <RotationControls
            isRotating={globeRotating}
            onToggle={() => setGlobeRotating(!globeRotating)}
            t={t}
          />
        </div>
      </div>

      {isActive && (
        <div className="h-[600px] w-full rounded-lg overflow-hidden border border-border relative">
          <ErrorBoundary>
            <MoneyFlow
              etfs={etfs}
              topHoldingsCount={topHoldingsCount[0]}
              isRotating={globeRotating}
              ctrlPressed={ctrlPressed}
            />
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

export default MoneyFlowView;

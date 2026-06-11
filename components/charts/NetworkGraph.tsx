'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { useTheme } from 'next-themes';
import { EtfConfig } from '../../lib/types';
import { generateNetworkData } from '../../lib/math';
import { useTranslation } from '../../lib/i18n/LanguageContext';

interface NetworkGraphProps {
  etfs: EtfConfig[];
  limit: number[];
  livePhysics: boolean;
}

interface NodeObj {
  id?: string;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  name?: string;
  group?: 'etf' | 'holding';
  val?: number;
  [key: string]: unknown;
}

interface LinkObj {
  source?: string | NodeObj;
  target?: string | NodeObj;
  value?: number;
  [key: string]: unknown;
}

export function NetworkGraph({ etfs, limit, livePhysics }: NetworkGraphProps) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [isSettling, setIsSettling] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const isExtremeVolume = limit[0] > 1000;
  const isHighVolume = limit[0] > 300;

  const rawData = useMemo(() => generateNetworkData(etfs, limit[0]), [etfs, limit]);

  const sharedHoldings = useMemo(() => {
    const etfMap: Record<string, Set<string>> = {};
    rawData.links.forEach((l) => {
      const link = l as unknown as LinkObj;
      const targetId =
        typeof link.target === 'object' && link.target !== null ? link.target.id : link.target;
      const sourceId =
        typeof link.source === 'object' && link.source !== null ? link.source.id : link.source;
      if (typeof targetId === 'string' && typeof sourceId === 'string') {
        if (!etfMap[targetId]) etfMap[targetId] = new Set();
        etfMap[targetId].add(sourceId);
      }
    });
    return new Set(Object.keys(etfMap).filter((k) => etfMap[k].size > 1));
  }, [rawData.links]);

  const data = rawData;

  // Whenever the data changes (e.g. slider moves), the physics engine will wake up to calculate the new graph
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSettling(true);
  }, [data]);

  // Resize observer to make the 3D canvas responsive
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height: entries[0].contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const prevLivePhysics = useRef(livePhysics);

  // Reheat the simulation when the user toggles Live Physics
  useEffect(() => {
    if (prevLivePhysics.current !== livePhysics) {
      prevLivePhysics.current = livePhysics;
      // Add a small delay to ensure ForceGraph3D's internal asynchronous layout initialization is complete
      const timer = setTimeout(() => {
        if (fgRef.current && fgRef.current.d3ReheatSimulation) {
          try {
            fgRef.current.d3ReheatSimulation();
          } catch (e) {
            console.warn('Reheat failed:', e);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [livePhysics]);

  // Tweak physics engine dynamically based on node count
  useEffect(() => {
    // Delay tweaks slightly to ensure internal d3ForceLayout is fully instantiated
    const timer = setTimeout(() => {
      if (fgRef.current) {
        try {
          // Disable default center force
          const centerForce = fgRef.current.d3Force('center');
          if (centerForce) centerForce.strength(0);

          // Balance magnetic repulsion so holdings form a cloud but don't explode
          const chargeForce = fgRef.current.d3Force('charge');
          if (chargeForce) chargeForce.strength(isExtremeVolume ? -40 : isHighVolume ? -60 : -100);

          // Give the springs enough distance so holdings don't clump directly inside the ETF sphere
          const linkForce = fgRef.current.d3Force('link');
          if (linkForce) linkForce.distance(isExtremeVolume ? 50 : isHighVolume ? 70 : 90);

          // Custom gravity force: pulls disconnected ETFs and flying nodes back to the dead center (0,0,0)
          fgRef.current.d3Force('gravity', (alpha: number) => {
            data.nodes.forEach((n) => {
              const node = n as unknown as NodeObj;
              // ETFs get pulled strongly to the center, holdings get pulled gently
              const pullStrength = node.group === 'etf' ? 0.08 : 0.01;
              if (node.vx !== undefined && node.x !== undefined)
                node.vx -= node.x * alpha * pullStrength;
              if (node.vy !== undefined && node.y !== undefined)
                node.vy -= node.y * alpha * pullStrength;
              if (node.vz !== undefined && node.z !== undefined)
                node.vz -= node.z * alpha * pullStrength;
            });
          });
        } catch (e) {
          console.warn('Error tweaking physics', e);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [data, isHighVolume, isExtremeVolume]);

  // Set colors based on current theme
  const isDark = resolvedTheme === 'theme-cyberpunk';

  // Custom colors for nodes
  const etfColor = isDark ? '#22d3ee' : '#2563eb'; // Cyan vs Blue
  const holdingColor = isDark ? '#f472b6' : '#db2777'; // Pink
  const linkColor = isExtremeVolume
    ? isDark
      ? '#333333'
      : '#e5e7eb' // Solid colors remove expensive GPU alpha blending
    : isDark
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(0, 0, 0, 0.4)';

  if (!data || data.nodes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-112.5 relative rounded-xl overflow-hidden bg-background"
    >
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        cooldownTicks={livePhysics ? Infinity : 100}
        enableNodeDrag={livePhysics}
        nodeLabel="name"
        nodeAutoColorBy="group"
        nodeColor={(node) => ((node as NodeObj).group === 'etf' ? etfColor : holdingColor)}
        nodeVal={(node) => {
          const n = node as NodeObj;
          // We want the sphere's visual RADIUS to scale based on the percentage of the total portfolio (node.val).
          // ForceGraph3D calculates its visual radius using the cube root of nodeVal ( R ∝ cbrt(nodeVal) ).
          // To make the radius linearly proportional to the percentage, we must supply the cube of our desired radius.
          const percentage = n.val || 0.1;

          if (n.group === 'etf') {
            // ETFs get a larger base radius
            const targetRadius = Math.max(6, percentage * 0.3);
            return Math.pow(targetRadius, 3);
          } else {
            // Holdings scale more aggressively with their percentage
            const targetRadius = Math.max(1.5, percentage * 1.2);
            return Math.pow(targetRadius, 3);
          }
        }}
        nodeOpacity={1}
        nodeResolution={
          livePhysics || isSettling
            ? isExtremeVolume
              ? 4
              : isHighVolume
                ? 8
                : 16 // Performance mode (leaves CPU for physics)
            : isExtremeVolume
              ? 12
              : isHighVolume
                ? 24
                : 32 // High Quality mode (perfect spheres)
        }
        onEngineStop={() => setIsSettling(false)}
        nodeThreeObject={
          ((node: object) => {
            const n = node as NodeObj;
            // Render labels only for ETFs or shared holdings
            if (n.name && (n.group === 'etf' || (n.id && sharedHoldings.has(n.id)))) {
              const sprite = new SpriteText(n.name);
              sprite.color = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';

              if (n.group === 'etf') {
                sprite.textHeight = 8;
                sprite.fontWeight = 'bold';
                sprite.position.y = 18; // Physically lift the text above the ETF sphere
              } else {
                sprite.textHeight = Math.max(3.5, Math.sqrt(n.val || 0) * 2.5);
                sprite.fontWeight = 'normal';
                sprite.position.y = 8; // Physically lift the text above the holding sphere
              }

              // Force the text to render on top of all 3D objects
              sprite.material.depthWrite = false;
              sprite.material.depthTest = false;
              sprite.renderOrder = 999;

              return sprite;
            }
            return null; // Don't render permanent text for unshared nodes
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
        }
        nodeThreeObjectExtend={true}
        linkVisibility={(link) => {
          const l = link as LinkObj;
          if (isExtremeVolume) {
            const targetId =
              typeof l.target === 'object' && l.target !== null ? l.target.id : l.target;
            return typeof targetId === 'string' && sharedHoldings.has(targetId);
          }
          return true;
        }}
        linkWidth={(link) => Math.max(0.5, Math.sqrt((link as LinkObj).value || 0) * 1.5)}
        linkColor={() => linkColor}
        linkOpacity={isExtremeVolume ? 1 : 0.4}
        linkDirectionalParticles={(link) => {
          const l = link as LinkObj;
          if (isHighVolume) {
            const targetId =
              typeof l.target === 'object' && l.target !== null ? l.target.id : l.target;
            return typeof targetId === 'string' && sharedHoldings.has(targetId) ? 2 : 0;
          }
          return 3;
        }}
        linkDirectionalParticleWidth={(link) =>
          Math.max(1.5, Math.sqrt((link as LinkObj).value || 0))
        }
        linkDirectionalParticleSpeed={(link) => ((link as LinkObj).value || 0) * 0.0005 + 0.005}
        backgroundColor="rgba(0,0,0,0)" // Transparent to let tailwind bg show
        showNavInfo={false}
      />
      <div className="absolute top-4 left-4 pointer-events-none bg-background/90 backdrop-blur-md px-4 py-3 rounded-xl border border-border shadow-lg flex flex-col gap-3 min-w-70">
        <p className="text-xs font-bold uppercase tracking-widest text-foreground">
          {t.threeDVisuals.legend}
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: etfColor, boxShadow: `0 0 8px ${etfColor}` }}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {t.threeDVisuals.etfs}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: holdingColor, boxShadow: `0 0 8px ${holdingColor}` }}
            />
            <span className="text-xs text-muted-foreground font-medium">
              {t.threeDVisuals.overlappingHoldings}
            </span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/80 max-w-62.5 leading-tight mt-1">
          {t.threeDVisuals.networkLegendDesc}
        </p>
      </div>
    </div>
  );
}

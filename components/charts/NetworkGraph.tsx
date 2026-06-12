'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useTheme } from 'next-themes';
import { EtfConfig } from '@/lib/types';
import { generateNetworkData } from '@/lib/math';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface NetworkGraphProps {
  etfs: EtfConfig[];
  limit: number[];
  livePhysics: boolean;
  overlapOnly?: boolean;
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

// Helper to reliably extract the ID from a link's source or target,
// as ForceGraph3D mutates them from strings into object references
const getLinkId = (node: string | NodeObj | undefined): string | undefined =>
  typeof node === 'object' && node !== null ? node.id : (node as string | undefined);

export function NetworkGraph({ etfs, limit, livePhysics, overlapOnly }: NetworkGraphProps) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [isSettling, setIsSettling] = useState(true);
  const [hoverNode, setHoverNode] = useState<NodeObj | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isExtremeVolume = limit[0] > 1000;
  const isHighVolume = limit[0] > 300;

  // Set colors based on current theme early so effects can use them
  const isCyberpunk = resolvedTheme === 'theme-cyberpunk';
  const isCartoon = resolvedTheme === 'theme-cartoon';
  const isProfessional = resolvedTheme === 'theme-professional';

  const isDark = isCyberpunk;

  let bgColor = '#09090b'; // Cyberpunk dark
  if (isCartoon) bgColor = '#fdf6e3'; // Cartoon warm cream
  if (isProfessional) bgColor = '#fcfcfc'; // Professional clean white

  const rawData = useMemo(() => generateNetworkData(etfs, limit[0]), [etfs, limit]);

  const sharedHoldings = useMemo(() => {
    const etfMap: Record<string, Set<string>> = {};
    rawData.links.forEach((l) => {
      const link = l as unknown as LinkObj;
      const targetId = getLinkId(link.target);
      const sourceId = getLinkId(link.source);
      if (targetId && sourceId) {
        if (!etfMap[targetId]) etfMap[targetId] = new Set();
        etfMap[targetId].add(sourceId);
      }
    });
    return new Set(Object.keys(etfMap).filter((k) => etfMap[k].size > 1));
  }, [rawData.links]);

  const data = useMemo(() => {
    if (!overlapOnly) return rawData;
    const filteredNodes = rawData.nodes.filter((n) => {
      const node = n as NodeObj;
      return node.group === 'etf' || (node.id && sharedHoldings.has(node.id));
    });
    const nodeIds = new Set(filteredNodes.map((n) => (n as NodeObj).id));
    const filteredLinks = rawData.links.filter((l) => {
      const link = l as LinkObj;
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      return sourceId && targetId && nodeIds.has(sourceId) && nodeIds.has(targetId);
    });
    return { nodes: filteredNodes, links: filteredLinks };
  }, [rawData, overlapOnly, sharedHoldings]);

  const neighbors = useMemo(() => {
    const map = new Map<string, Set<string>>();
    data.nodes.forEach((n) => map.set((n as NodeObj).id!, new Set()));
    data.links.forEach((l) => {
      const link = l as LinkObj;
      const sourceId = getLinkId(link.source);
      const targetId = getLinkId(link.target);
      if (sourceId && targetId) {
        map.get(sourceId)?.add(targetId);
        map.get(targetId)?.add(sourceId);
      }
    });
    return map;
  }, [data]);

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

  // Tweak physics engine dynamically based on node count and display mode
  useEffect(() => {
    // Delay tweaks slightly to ensure internal d3ForceLayout is fully instantiated
    const timer = setTimeout(() => {
      if (fgRef.current) {
        try {
          // Disable default center force
          const centerForce = fgRef.current.d3Force('center');
          if (centerForce) centerForce.strength(0);

          // Balance magnetic repulsion so holdings form a cloud but don't explode
          // If overlapOnly is active, there are fewer nodes, so we need way more repulsion to prevent collapse
          const chargeForce = fgRef.current.d3Force('charge');
          if (chargeForce)
            chargeForce.strength(
              overlapOnly ? -300 : isExtremeVolume ? -40 : isHighVolume ? -60 : -100
            );

          // Give the springs enough distance so holdings don't clump directly inside the ETF sphere
          const linkForce = fgRef.current.d3Force('link');
          if (linkForce)
            linkForce.distance(overlapOnly ? 150 : isExtremeVolume ? 50 : isHighVolume ? 70 : 90);

          // Custom gravity force: pulls disconnected ETFs and flying nodes back to the dead center (0,0,0)
          fgRef.current.d3Force('gravity', (alpha: number) => {
            data.nodes.forEach((n) => {
              const node = n as unknown as NodeObj;
              // ETFs get pulled strongly to the center, holdings get pulled gently
              // When overlapOnly is active, reduce gravity to let the graph breathe
              const pullStrength = overlapOnly
                ? node.group === 'etf'
                  ? 0.02
                  : 0.005
                : node.group === 'etf'
                  ? 0.08
                  : 0.01;
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
  }, [data, isHighVolume, isExtremeVolume, overlapOnly]);

  // Apply Bloom Post-Processing Effect safely
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bloomPass: any = null;
    const currentFg = fgRef.current;

    // Slight delay to ensure the WebGL renderer and composer are fully initialized
    const timer = setTimeout(() => {
      if (currentFg) {
        try {
          const composer = currentFg.postProcessingComposer();
          if (composer) {
            // Check if it already has a bloom pass (handles Hot-Reloads safely)
            const hasBloom = composer.passes.some(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (p: any) => p.constructor.name === 'UnrealBloomPass'
            );

            // Only apply Bloom in Dark themes!
            if (isDark && !hasBloom) {
              bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.02, // Extremely faint halo
                0.4, // Uniform radius
                0.2 // Low threshold
              );
              composer.addPass(bloomPass);
            }
          }
        } catch {
          // ignore
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (bloomPass) {
        if (currentFg) {
          try {
            const composer = currentFg.postProcessingComposer();
            if (composer) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              composer.passes = composer.passes.filter((p: any) => p !== bloomPass);
            }
          } catch {
            // ignore
          }
        }
        // Dispose memory asynchronously to prevent crashing the active render loop during unmount
        setTimeout(() => {
          try {
            if (typeof bloomPass.dispose === 'function') bloomPass.dispose();
          } catch {
            // ignore
          }
        }, 500);
      }
    };
  }, [resolvedTheme, isDark]);

  // Apply even lighting so spheres bloom on all sides
  useEffect(() => {
    let ambientLight: THREE.AmbientLight | null = null;
    const currentFg = fgRef.current;

    const timer = setTimeout(() => {
      if (currentFg) {
        const scene = currentFg.scene();
        // Add strong ambient light so the Lambert material is illuminated evenly.
        ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
        scene.add(ambientLight);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (currentFg && ambientLight) {
        currentFg.scene().remove(ambientLight);
      }
    };
  }, []);

  // Custom colors for nodes
  // In Light themes, we use vibrant colors (instead of black/dark) so they emit enough light to bloom in WebGL,
  // while still being dark enough to be visible against the white CSS background.
  const etfColor = isDark ? '#22d3ee' : '#3b82f6'; // Cyan vs Blue
  const holdingColor = isDark ? '#f472b6' : '#ec4899'; // Pink-400 vs Pink-500
  const defaultLinkColor = isExtremeVolume
    ? isDark
      ? '#333333'
      : '#94a3b8' // Slate-400 (bright enough to bloom, dark enough for white bg)
    : isDark
      ? 'rgba(255, 255, 255, 0.4)'
      : 'rgba(99, 102, 241, 0.4)'; // Indigo-500 links instead of black!

  if (!data || data.nodes.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="w-full h-150 relative rounded-xl overflow-hidden bg-background"
    >
      <ForceGraph3D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={data}
        cooldownTicks={livePhysics ? Infinity : 100}
        enableNodeDrag={livePhysics}
        onNodeHover={(node) => setHoverNode((node as NodeObj) || null)}
        nodeLabel={(node) => {
          const n = node as NodeObj;
          let html = `<div style="background: rgba(0,0,0,0.8); padding: 8px; border-radius: 8px; color: white; font-family: sans-serif; pointer-events: none;">`;
          html += `<div style="font-weight: bold; margin-bottom: 4px;">${n.name || n.id}</div>`;
          if (n.group === 'holding' && n.val !== undefined) {
            html += `<div style="font-size: 12px; opacity: 0.8;">${t.threeDVisuals.weightInPortfolio} <strong style="color: #f472b6;">${n.val.toFixed(2)}%</strong></div>`;
          }
          if (n.group === 'etf' && n.val !== undefined) {
            html += `<div style="font-size: 12px; opacity: 0.8;">${t.threeDVisuals.totalEtfWeight} <strong style="color: #22d3ee;">${n.val.toFixed(2)}%</strong></div>`;
          }
          html += `</div>`;
          return html;
        }}
        nodeAutoColorBy="group"
        nodeColor={(node) => {
          const n = node as NodeObj;
          const isHovered = hoverNode === n;
          const isNeighbor = hoverNode && n.id && neighbors.get(hoverNode.id!)?.has(n.id!);
          const color = n.group === 'etf' ? etfColor : holdingColor;

          if (hoverNode && !isHovered && !isNeighbor) {
            return isDark ? 'rgba(50,50,50,0.3)' : 'rgba(200,200,200,0.3)';
          }
          return color;
        }}
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

            // Hover logic: hide unrelated labels
            const isHovered = hoverNode === n;
            const isNeighbor = hoverNode && n.id && neighbors.get(hoverNode.id!)?.has(n.id!);
            if (hoverNode && !isHovered && !isNeighbor) return null;

            // Render labels only for ETFs or shared holdings
            if (n.name && (n.group === 'etf' || (n.id && sharedHoldings.has(n.id)))) {
              // LOD: we could check camera distance here if we wanted, but for now we'll
              // just let the user hover to see rich tooltips, and keep sprites for major nodes.
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
        linkColor={(link) => {
          const l = link as LinkObj;
          const sourceId = typeof l.source === 'object' ? (l.source as NodeObj).id : l.source;
          const targetId = typeof l.target === 'object' ? (l.target as NodeObj).id : l.target;

          if (hoverNode) {
            if (sourceId === hoverNode.id || targetId === hoverNode.id) {
              return isDark ? '#ffffff' : '#000000'; // High contrast for focused links
            }
            return 'rgba(0,0,0,0.02)'; // Fade out other links
          }
          return defaultLinkColor;
        }}
        linkOpacity={hoverNode ? 1 : isExtremeVolume ? 1 : 0.4}
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
        backgroundColor={bgColor} // Solid color derived exactly from the CSS theme
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

'use client';

import React, { useRef, useState, useEffect } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import SpriteText from 'three-spritetext';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { NetworkGraphProps, NodeObj, LinkObj } from './types';
import { useNetworkData } from './useNetworkData';
import {
  usePhysicsReheat,
  usePhysicsTweaks,
  useBloomEffect,
  useAmbientLight,
  useCameraPersistence,
} from './useNetworkEffects';
import { useNetworkTheme } from './useNetworkTheme';
import { NetworkLegend } from './NetworkLegend';

export function NetworkGraph({ etfs, limit, livePhysics, overlapOnly }: NetworkGraphProps) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 450 });
  const [isSettling, setIsSettling] = useState(true);
  const [hoverNode, setHoverNode] = useState<NodeObj | null>(null);

  const isExtremeVolume = limit[0] > 1000;
  const isHighVolume = limit[0] > 300;

  const { isDark, bgColor, etfColor, holdingColor, resolvedTheme, getLinkColor } =
    useNetworkTheme();
  const defaultLinkColor = getLinkColor(isExtremeVolume);

  const { data, sharedHoldings, neighbors } = useNetworkData(etfs, limit[0], overlapOnly);

  // Whenever the data changes, physics wakes up
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsSettling(true);
  }, [data]);

  // Resize observer
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

  usePhysicsReheat(fgRef, livePhysics);
  usePhysicsTweaks(fgRef, data, isHighVolume, isExtremeVolume, overlapOnly);
  useBloomEffect(fgRef, isDark, resolvedTheme);
  useAmbientLight(fgRef);
  useCameraPersistence(fgRef);

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
            html += `<div style="font-size: 12px; opacity: 0.8;">${t.pages.analyzer.dashboard.tabs.threeDVisuals.weightInPortfolio} <strong style="color: #f472b6;">${n.val.toFixed(2)}%</strong></div>`;
          }
          if (n.group === 'etf' && n.val !== undefined) {
            html += `<div style="font-size: 12px; opacity: 0.8;">${t.pages.analyzer.dashboard.tabs.threeDVisuals.totalEtfWeight} <strong style="color: #22d3ee;">${n.val.toFixed(2)}%</strong></div>`;
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
          const percentage = n.val || 0.1;
          if (n.group === 'etf') {
            const targetRadius = Math.max(6, percentage * 0.3);
            return Math.pow(targetRadius, 3);
          } else {
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
                : 16
            : isExtremeVolume
              ? 12
              : isHighVolume
                ? 24
                : 32
        }
        onEngineStop={() => setIsSettling(false)}
        nodeThreeObject={
          ((node: object) => {
            const n = node as NodeObj;
            const isHovered = hoverNode === n;
            const isNeighbor = hoverNode && n.id && neighbors.get(hoverNode.id!)?.has(n.id!);
            if (hoverNode && !isHovered && !isNeighbor) return null;

            if (n.name && (n.group === 'etf' || (n.id && sharedHoldings.has(n.id)))) {
              const sprite = new SpriteText(n.name);
              sprite.color = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.9)';

              if (n.group === 'etf') {
                sprite.textHeight = 8;
                sprite.fontWeight = 'bold';
                sprite.position.y = 18;
              } else {
                sprite.textHeight = Math.max(3.5, Math.sqrt(n.val || 0) * 2.5);
                sprite.fontWeight = 'normal';
                sprite.position.y = 8;
              }

              sprite.material.depthWrite = false;
              sprite.material.depthTest = false;
              sprite.renderOrder = 999;

              return sprite;
            }
            return null;
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
              return isDark ? '#ffffff' : '#000000';
            }
            return 'rgba(0,0,0,0.02)';
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
        backgroundColor={bgColor}
        showNavInfo={false}
      />
      <NetworkLegend etfColor={etfColor} holdingColor={holdingColor} />
    </div>
  );
}

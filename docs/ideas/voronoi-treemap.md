# Voronoi Treemap

## Problem Statement

How might we create an immersive, premium 2D visualization in the "Fund Details" tab that displays portfolio holdings as organic, glowing cells without lagging the browser when rendering thousands of assets?

## Recommended Direction: The Smart Cluster

We will build a 2D SVG-based Voronoi Treemap using `d3-voronoi-treemap` and React/Framer Motion. To achieve the "cyberpunk/neon" aesthetic without sacrificing performance, we will only compute and render exact polygons for the top ~150 holdings. The thousands of remaining micro-holdings will be grouped into a single "Tail" cell and represented as a glowing particle starfield, ensuring smooth 60fps animations and instant calculations.

## Key Assumptions to Validate

- [ ] **Compute Time:** We assume calculating a Voronoi treemap for ~150 weighted nodes takes <100ms and won't noticeably block the main thread.
- [ ] **Visual Hierarchy:** We assume users will find an aggregated "Tail" cell acceptable and actually preferable to a noisy cluster of sub-pixel polygons.
- [ ] **Algorithm Stability:** We assume the `d3-voronoi-treemap` iterative relaxation won't result in jittery polygons on re-renders.

## MVP Scope

- Implement `d3-voronoi-treemap` logic isolated in a custom hook.
- A 2D SVG container in the "Fund Details" tab.
- Render Top 100 cells with dynamic stroke colors (e.g., based on Sector or Asset Class) and neon CSS `drop-shadow`.
- Hover tooltips showing Holding Name, Ticker, and Weight.
- A single "Tail" cell for the rest of the holdings.

## Not Doing (and Why)

- **3D Rendering:** The user requested we keep it 2D for now to focus on layout and performance.
- **Computing 3,000+ exact polygons:** It will freeze the browser and destroy the premium feel with lag.
- **Real-time price pulsing:** We don't have live tick data; animation will be purely UI-driven (hover/entry).

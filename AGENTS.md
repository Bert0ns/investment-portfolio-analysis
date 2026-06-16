# Project: Capital Lens & Savings Plan Dashboard

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Tech Stack

- Next.js 16.2.7 (App Router), React 19.2.4
- TypeScript 5, Tailwind CSS 4
- UI: Shadcn UI, Framer Motion, Lucide React
- Visualizations: Three.js, React Three Fiber, Recharts, D3-Sankey, React-SVG-Worldmap
- Parsing: PapaParse

## Commands

- Dev: `pnpm dev`
- Build: `pnpm build`
- Test: `pnpm test`
- Lint: `pnpm lint`
- Type check: `pnpm typecheck`
- Format: `pnpm format`
- _After major changes, always run: `pnpm lint && pnpm typecheck && pnpm test`_

## Boundaries & Constraints

- **100% Client-Side:** No databases, no backend. All parsing and math are executed locally.
- **Data Storage:** State is preserved securely in the browser's `localStorage` or `IndexedDB`.
- **UI Aesthetics:** Cyberpunk aesthetic, immersive sharp-cornered UI with glowing neon gradients, dark mode, and micro-animations. Generous padding, sober color palette.
- **SOLID Principles:** Use the Strategy Pattern for CSV parsing. Maintain clear separation between UI, state logic (Custom Hooks), and business logic (Utility/Math functions).

## Code Conventions

- Strict typing in TypeScript (avoid `any`).
- Explicit, self-documenting variable and function names in English.
- Elegant error handling via non-blocking UI notifications (e.g., Sonner toasts).
- Use `shadcn` components as defaults.
- Functional components with hooks.
- Incremental and modular development.

## Project Map

- `/app`: Next.js App Router structure and main layouts.
- `/components`: Reusable Shadcn/Tailwind UI elements and feature widgets.
- `/hooks`: Custom React hooks for isolated state logic (e.g., `useSavingsPlan`, `usePortfolio`).
- `/lib`: Pure, isolated business logic, mathematics (`lib/math`), type definitions, and CSV parsing strategies (`lib/parsers`).
- `/__tests__`: Unit tests ensuring zero regression.

## Patterns

- **CSV Ingestion:** Implement `CsvParserStrategy` for any new issuer, isolated in `/lib/parsers/`. Adding a new issuer MUST NOT require modifying the main parser logic.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Development Guidelines (AI Agent Directives)

- **SOLID Principles & Architectural Patterns:**
  - **Single Responsibility / Open-Closed:** Use the **Strategy Pattern** for CSV parsing. Create a `CsvParserStrategy` interface/type and specific implementation functions (e.g., `parseVanguardCsv`, `parseISharesCsv`). Adding a new issuer must not require modifying the main parser.
  - Maintain a clear separation between UI Components, state logic (Custom Hooks for portfolio/localStorage management), and business logic (Utility functions for mathematical aggregation).

- **Clean Code:**
  - Strict typing in TypeScript (avoid `any`).
  - Explicit, self-documenting variable and function names in English.
  - Elegant error handling (e.g., CSV files with missing columns) via non-blocking error messages on the UI (e.g., Toast notifications).

- **Design & UI (Tailwind CSS):**
  - Use shacnui as default
  - Simple, modern, and minimalist aesthetics (Vercel/Radix UI inspiration).
  - Use card containers with soft borders, soft shadows, ample whitespace (generous padding), and a sober color palette.
  - Fully responsive layout (Grid/Flexbox).

- **Agile Methodology:**
  - Incremental and modular development: start from the skeleton, implement the parsing logic, manage the global state, and finally connect the interactive charts.

Use the pnpm package manager

Use the scripts in package.json if applicable

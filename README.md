# 📈 Capital Lens & Savings Plan Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?style=for-the-badge&logo=jest)

A powerful, **100% client-side** web application designed to help retail investors and financial enthusiasts deeply analyze their custom ETF portfolios. Upload official holdings CSV files from top issuers, allocate your capital visually, and unveil your _true_ underlying global exposure in seconds.

## ✨ Features

- **🌍 Interactive 3D Visuals**: Explore your geographic exposure on a fully interactive, auto-rotating 3D globe powered by Three.js and React Three Fiber, featuring dynamic exposure pillars and bloom effects.
- **🎨 Cyberpunk Aesthetic**: A deeply immersive, sharp-cornered UI with glowing neon gradients, polished dark mode, and seamless micro-animations.
- **📊 True Underlying Exposure**: Input multiple ETFs and instantly view aggregated Geographic, Sector, and Currency allocations as if your portfolio was a single giant fund.
- **🏦 Multi-Issuer Support**: Built-in CSV parsers for the world's leading asset managers: **iShares, Vanguard, Amundi, and Lyxor**.
- **🎛️ Interactive Allocation**: Fluidly adjust your ETF weights using range sliders and watch your dashboard react and recompute instantaneously.
- **📈 Savings Plan Calculator**: Advanced financial math engine to simulate a long-term Dollar-Cost Averaging (DCA) strategy. Configure expected returns, monthly contributions, and "stop accumulating" thresholds.
- **🛡️ Risk Analysis & KPI**: Track your Weighted Average TER (Total Expense Ratio), fund domiciles, replication methods (Physical vs. Synthetic), and use of profit.
- **🔒 100% Privacy & Serverless**: No databases. No backend. No user data leaves your browser. All parsing and math are executed locally, and state is preserved securely in your browser's `localStorage`.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and `pnpm` installed.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Bert0ns/investment-portfolio-analysis.git
   cd investment-portfolio-analysis
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to start building your portfolio.

### 📱 Testing on Mobile

If you want to test the responsive UI on your mobile device (especially useful if you are developing inside WSL), the easiest method is to use a local tunnel to bypass local network NAT issues and Next.js Hot Module Replacement CORS blocks:

1. Ensure your Next.js server is running (`pnpm dev`).
2. Open a new terminal tab and start a secure tunnel with a fixed subdomain:

   ```bash
   pnpm dlx localtunnel --port 3000 --subdomain berto-dev
   ```

3. Open your mobile browser and visit: `https://berto-dev.loca.lt`

_(Note: `berto-dev.loca.lt` is pre-approved in `next.config.ts` to allow cross-origin HMR. If you change the subdomain, update `allowedDevOrigins` in the config!)_

---

## 📂 How to Use & Get ETF Data

To analyze your portfolio, you need the official CSV files from the ETF issuers. The application relies entirely on exact, raw data directly from the providers.

**Critical Instructions for CSVs:**

1. **Visit the issuer's website:** Go directly to the official site for your ETF (e.g., iShares, Vanguard, Amundi).
2. **Search your ETF:** Use the ETF Name or ISIN code to find the exact fund page.
3. **Locate the Holdings:** Find the "Holdings", "Participations", or "Constituents" section.
4. **Download the Data:** Click the download button and ensure you select the **CSV (UTF-8)** format.
5. **⚠️ DO NOT OPEN THE FILE:** This is extremely important. Do not open or edit the file in Microsoft Excel or Apple Numbers before uploading. Spreadsheets often corrupt delimitations, drop decimals, and ruin numeric formats.
6. **Upload:** Simply drag and drop or upload the raw, untouched CSV file directly into the Web App.

---

## 🏗️ Architecture & Code Quality

This project is built following strict **SOLID** and Agile engineering principles:

- **Single Responsibility Principle (SRP):** Complete separation between UI components, React state management (Custom Hooks), and complex financial algorithms (`lib/math.ts`).
- **Open-Closed Principle (OCP):** CSV ingestion uses the **Strategy Pattern** (`lib/parsers/strategies.ts`). Adding support for a new broker/issuer (e.g., Fidelity) is as simple as creating a new class that implements the `CsvParserStrategy` interface, without touching existing logic.
- **Tested & Robust:** Comprehensive test coverage using `Jest` and `@testing-library/react`.

### Project Structure

- `/app` - Next.js App Router structure and main layouts.
- `/components` - Reusable Shadcn/Tailwind UI elements and feature widgets.
- `/hooks` - Custom React hooks for isolated state logic (e.g., `useSavingsPlan.ts`, `usePortfolio.ts`).
- `/lib` - Pure, isolated business logic, mathematics, type definitions, and CSV parsing strategies.
- `/__tests__` - Unit tests ensuring zero regression.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to add support for a new ETF Issuer (SPDR, Invesco, WisdomTree, etc.):

1. Fork the project.
2. Use conventional commits.
3. Do only the minimal changes necessary.
4. Keep code clean, maintainable and well structured.
5. Open a Pull Request!

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 💡 Future Roadmap (Draft Ideas)

1. **Historical Backtesting Chart:** Integration with historical price APIs to chart a simulated backtested growth curve for your exact portfolio configuration over the last 1-5 years.
2. **Correlation Matrix Heatmap:** A visual heatmap matrix that calculates how closely correlated the ETFs are to one another, helping flag redundancies and ensure true diversification.
3. **Deep Dive & Geographic Search:** A dedicated feature that allows users to isolate and analyze the full statistics of a single ETF at a time
4. **3D Overlap Terrain (Topographic Map)**: Instead of a network, visualize ETF overlap as a 3D topographical map. The X and Y axes represent the different ETFs, and the Z-axis (the  
   "mountains") represents the percentage of shared holdings. Highly overlapping portfolios would look like massive mountain ranges, while  
   diversified portfolios would look like flat plains.
5. **3DSankey "Money Flow" Diagram**: A stunning, flowing Sankey diagram that tracks how a single dollar is split. It starts as one large stream on the left ("Total Portfolio"), splits
   into your ETFs, then flows into Sectors, and finally breaks off into individual top companies. It is the absolute best way to visualize exposure  
   distribution.
6. **Radar Chart**
7. **Voronoi Treemap**: Instead of boring rectangular treemaps, Voronoi treemaps use organic, cell-like shapes. It looks like viewing plant cells under a microscope,  
   where the largest "cells" are your biggest holdings. It looks incredibly premium, especially with our cyberpunk/dark mode styling
8. Geographic "X-Ray" Search

A dedicated section on the dashboard where users can query their exact geographic exposure.

• Search by Country/Region: A user types "Japan". The tool instantly scans all 5,000+ underlying holdings across all their ETFs.
• Contribution Breakdown: It tells the user: "You have 6.5% total exposure to Japan. This comes from: 4% via iShares Core MSCI World, 2% via  
 Vanguard Emerging Markets, and 0.5% via Amundi Asia."
• Company Drill-Down: Underneath the country stats, it lists the actual Japanese companies they own indirectly (e.g., Toyota, Sony) and their  
 exact weights in the total portfolio.
• Interactive Global Map: We could add an interactive SVG world map. Hovering over or clicking a country (like Brazil or India) acts as a quick-  
 filter, immediately sliding out a panel with the exact ETFs supplying that exposure.

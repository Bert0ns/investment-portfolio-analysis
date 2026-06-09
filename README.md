# 📈 ETF Portfolio Analyzer & Savings Plan Dashboard

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
![Jest](https://img.shields.io/badge/Tested%20with-Jest-C21325?style=for-the-badge&logo=jest)

A powerful, **100% client-side** web application designed to help retail investors and financial enthusiasts deeply analyze their custom ETF portfolios. Upload official holdings CSV files from top issuers, allocate your capital visually, and unveil your _true_ underlying global exposure in seconds.

## ✨ Features

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

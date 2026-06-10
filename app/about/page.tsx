export default function AboutPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 py-16">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-8">About This Project</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p>
            The <strong>ETF Portfolio Analyzer</strong> was built to solve a common problem for
            retail investors: understanding exactly what they own when holding multiple Exchange
            Traded Funds (ETFs).
          </p>
          <p>
            When you buy an S&P 500 ETF and a World ETF, you are buying Apple and Microsoft twice.
            This tool aggregates the raw CSV holdings files directly from the issuers to reveal your
            true underlying exposure across geographies, sectors, and currencies.
          </p>
          <h3>Privacy First</h3>
          <p>
            This application is entirely <strong>client-side</strong>. It relies entirely on your
            browser to parse the CSV files and perform the heavy mathematical aggregations. No
            databases, no tracking, and your financial structure remains 100% private.
          </p>
          <h3>Future Roadmap</h3>
          <p>
            We are actively working on integrating advanced <strong>Three.js</strong> 3D
            visualizations, including an Interactive Exposure Globe and a Top Holdings Constellation
            network graph, to make portfolio analysis more intuitive and premium.
          </p>
        </div>
      </div>
    </main>
  );
}

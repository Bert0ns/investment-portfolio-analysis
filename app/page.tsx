import Link from 'next/link';
import { ArrowRight, BarChart3, Globe, Layers } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Unveil Your True <span className="text-blue-600 dark:text-blue-500">ETF Exposure</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10">
            A powerful, 100% client-side tool to deeply analyze your custom ETF portfolios. Upload
            official holdings CSVs, allocate capital, and discover your true underlying global
            exposure.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/analyzer"
              className={buttonVariants({
                size: 'lg',
                className:
                  'px-8 py-6 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg',
              })}
            >
              Launch Analyzer <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-24">
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
              <Layers className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Issuer Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Seamlessly parse official CSVs from iShares, Vanguard, Amundi, and Lyxor with zero
              manual formatting needed.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">True Geographic Mapping</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Aggregate the thousands of underlying holdings to see exactly which countries and
              sectors your money is really in.
            </p>
          </div>
          <div className="text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">100% Private & Serverless</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your financial data never leaves your browser. All parsing and math are executed
              locally in real-time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

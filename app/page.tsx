import Link from 'next/link';
import { ArrowRight, BarChart3, Globe, Layers } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background text-foreground overflow-hidden relative flex flex-col justify-center items-center w-full">
      {/* Abstract Glowing Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10 w-full flex flex-col items-center">
        <div className="text-center max-w-4xl mx-auto w-full">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-white uppercase">
            Unveil Your True{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              Exposure
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto font-light tracking-wide">
            A powerful, fully client-side tool to deeply analyze your custom ETF portfolios.
          </p>
          <div className="flex justify-center w-full">
            <Link
              href="/analyzer"
              className={buttonVariants({
                size: 'lg',
                className:
                  'px-12 py-8 text-lg font-bold rounded-none border border-primary/50 text-primary-foreground bg-primary hover:bg-primary/80 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all uppercase tracking-widest',
              })}
            >
              Launch System <ArrowRight className="w-6 h-6 ml-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full max-w-6xl mx-auto">
          <div className="bg-card/50 backdrop-blur-sm border border-white/5 p-8 flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Layers className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
              Multi-Issuer
            </h3>
            <p className="text-slate-400 leading-relaxed font-light">
              Seamlessly parse official CSVs from iShares, Vanguard, Amundi, and Lyxor with zero
              manual formatting.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-white/5 p-8 flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
              Global Mapping
            </h3>
            <p className="text-slate-400 leading-relaxed font-light">
              Aggregate thousands of underlying holdings to see exactly which countries and sectors
              your money is really in.
            </p>
          </div>
          <div className="bg-card/50 backdrop-blur-sm border border-white/5 p-8 flex flex-col items-center text-center hover:border-primary/30 transition-colors">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wider">
              Serverless
            </h3>
            <p className="text-slate-400 leading-relaxed font-light">
              Your financial data never leaves your browser. All parsing and math are executed
              locally in real-time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { Menu, LayoutDashboard, Info, ExternalLink } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  return (
    <nav className="border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="flex justify-between h-16 items-center w-full">
          <div className="flex items-center gap-3 relative z-10">
            <img
              src="/logo.svg"
              alt="ETF Analyzer"
              className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
            <Link
              href="/"
              className="font-black text-xl text-white tracking-widest uppercase hidden sm:block"
            >
              ETF Analyzer
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2 z-10">
            <Link
              href="/analyzer"
              className="text-sm font-medium text-slate-300 hover:text-primary transition-colors uppercase tracking-widest whitespace-nowrap"
            >
              Portfolio Analyzer
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-slate-300 hover:text-primary transition-colors uppercase tracking-widest"
            >
              About
            </Link>
            <a
              href="https://github.com/Bert0ns/investment-portfolio-analysis"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-300 hover:text-primary transition-colors uppercase tracking-widest"
            >
              GitHub
            </a>
          </div>

          {/* Right: Mobile Nav */}
          <div className="md:hidden flex items-center justify-end relative z-10">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l-white/10"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>

                <div className="flex flex-col items-center justify-center gap-4 mb-8 border-b border-white/10 pb-8 mt-10">
                  <img
                    src="/logo.svg"
                    alt="ETF Analyzer Logo"
                    className="w-16 h-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  />
                  <span className="font-black text-2xl text-white uppercase tracking-widest text-center">
                    ETF Analyzer
                  </span>
                </div>

                <div className="flex flex-col gap-4">
                  <Link
                    href="/analyzer"
                    className="flex items-center gap-4 px-4 py-4 rounded-none border border-transparent text-base font-medium text-slate-300 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Portfolio Analyzer
                  </Link>
                  <Link
                    href="/about"
                    className="flex items-center gap-4 px-4 py-4 rounded-none border border-transparent text-base font-medium text-slate-300 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                  >
                    <Info className="h-5 w-5" />
                    About
                  </Link>
                  <a
                    href="https://github.com/Bert0ns/investment-portfolio-analysis"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-4 px-4 py-4 rounded-none border border-transparent text-base font-medium text-slate-300 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                  >
                    <ExternalLink className="h-5 w-5" />
                    GitHub
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

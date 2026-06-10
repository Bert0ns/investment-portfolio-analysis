import Link from 'next/link';
import { Activity, Menu } from 'lucide-react';
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
    <nav className="border-b bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <Link href="/" className="font-bold text-lg text-gray-900 dark:text-gray-100">
              ETF Analyzer
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-6 items-center">
            <Link
              href="/analyzer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              App
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <a
              href="https://github.com/Bert0ns/investment-portfolio-analysis"
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu className="h-6 w-6" />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Navigation menu</SheetDescription>
                <div className="flex flex-col gap-6 mt-8">
                  <Link
                    href="/analyzer"
                    className="text-lg font-medium text-gray-900 dark:text-gray-100"
                  >
                    App
                  </Link>
                  <Link
                    href="/about"
                    className="text-lg font-medium text-gray-900 dark:text-gray-100"
                  >
                    About
                  </Link>
                  <a
                    href="https://github.com/Bert0ns/investment-portfolio-analysis"
                    target="_blank"
                    rel="noreferrer"
                    className="text-lg font-medium text-gray-900 dark:text-gray-100"
                  >
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

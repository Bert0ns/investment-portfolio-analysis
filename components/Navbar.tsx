'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, LayoutDashboard, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.5 5.5 0 0 0-1.5-3.89 5.06 5.06 0 0 0-.14-3.83s-1.18-.38-3.9 1.46a13.25 13.25 0 0 0-7 0C4.68 4.05 3.5 4.43 3.5 4.43a5.06 5.06 0 0 0-.14 3.83A5.5 5.5 0 0 0 2 12c0 5.22 3 6.42 6 6.76a4.8 4.8 0 0 0-1 3.24v4" />
    <path d="M9 19c-5 1.5-5-2.5-7-3" />
  </svg>
);

export default function Navbar() {
  const { t } = useTranslation();

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative">
        <div className="flex justify-between h-16 items-center w-full">
          <div className="flex items-center gap-3 relative z-10">
            <Image
              src="/logo.svg"
              alt="Portfolio Analyzer"
              width={32}
              height={32}
              className="w-8 h-8 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]"
            />
            <Link href="/" className="font-black text-xl tracking-widest uppercase hidden sm:block">
              <span className="text-foreground">Portfolio</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                Analyzer
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2 z-10">
            <Link
              href="/analyzer"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest whitespace-nowrap"
            >
              {t.navbar.dashboard}
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              {t.navbar.about}
            </Link>
          </div>

          {/* Right: Theme Switcher & Mobile Nav */}
          <div className="flex items-center gap-4 justify-end relative z-10">
            <div className="hidden md:flex items-center gap-2">
              <Button
                render={
                  <a
                    href="https://github.com/Bert0ns/investment-portfolio-analysis"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                nativeButton={false}
                variant="outline"
                size="icon"
                className="w-9 h-9 border-primary/50 hover:bg-primary/20 text-primary"
                title={t.navbar.github}
              >
                <GithubIcon className="h-4 w-4" />
                <span className="sr-only">{t.navbar.github}</span>
              </Button>
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                  <Menu className="h-6 w-6" />
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l-border flex flex-col h-full"
                >
                  <SheetTitle className="sr-only">{t.navbar.menu}</SheetTitle>
                  <SheetDescription className="sr-only">Navigation menu</SheetDescription>

                  <div className="flex flex-col items-center justify-center gap-4 mb-8 border-b border-border pb-8 mt-10">
                    <Image
                      src="/logo.svg"
                      alt="Portfolio Analyzer Logo"
                      width={64}
                      height={64}
                      className="w-16 h-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                    />
                    <span className="font-black text-2xl uppercase tracking-widest text-center">
                      <span className="text-foreground">Portfolio</span>{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                        Analyzer
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-4">
                    <Link
                      href="/analyzer"
                      className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      {t.navbar.dashboard}
                    </Link>
                    <Link
                      href="/about"
                      className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                    >
                      <Info className="h-5 w-5" />
                      {t.navbar.about}
                    </Link>
                    <a
                      href="https://github.com/Bert0ns/investment-portfolio-analysis"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
                    >
                      <GithubIcon className="h-5 w-5" />
                      {t.navbar.github}
                    </a>
                  </div>

                  <div className="mt-auto border-t border-border pt-8 pb-4 flex flex-col items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                      {t.navbar.language}
                    </span>
                    <LanguageSwitcher />
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-4">
                      {t.navbar.theme}
                    </span>
                    <ThemeSwitcher />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

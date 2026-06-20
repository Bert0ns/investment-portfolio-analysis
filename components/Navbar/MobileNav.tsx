import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { GithubIcon } from './GithubIcon';
import { useTranslation } from '@/lib/i18n/LanguageContext';

import { InstallPwaButton } from '@/components/InstallPwaButton';

type TranslationType = ReturnType<typeof useTranslation>['t'];

export function MobileNav({ t }: { t: TranslationType }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden flex items-center">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" />}>
          <Menu className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] bg-background/95 backdrop-blur-xl border-l-border flex flex-col h-full"
        >
          <SheetTitle className="sr-only">{t.components.common.navbar.menu}</SheetTitle>
          <SheetDescription className="sr-only">Navigation menu</SheetDescription>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex flex-col items-center justify-center gap-4 mb-8 border-b border-border pb-8 mt-10 hover:opacity-90 transition-opacity"
          >
            <Image
              src="/logo.svg"
              alt="Capital Lens Logo"
              width={64}
              height={64}
              className="w-16 h-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]"
            />
            <span className="font-black text-2xl uppercase tracking-widest text-center">
              <span className="text-foreground">Capital</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                Lens
              </span>
            </span>
          </Link>

          <div className="flex flex-col gap-4">
            <InstallPwaButton className="flex w-full items-center justify-center gap-4 px-4 py-4 rounded-md border border-primary/50 text-base font-bold text-primary hover:bg-primary/20 transition-all uppercase tracking-wider h-auto" />
            <Link
              href="/analyzer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
            >
              <LayoutDashboard className="h-5 w-5" />
              {t.components.common.navbar.dashboard}
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
            >
              <Info className="h-5 w-5" />
              {t.components.common.navbar.about}
            </Link>
            <a
              href="https://github.com/Bert0ns/capital-lens"
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-4 px-4 py-4 rounded-md border border-transparent text-base font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-wider"
            >
              <GithubIcon className="h-5 w-5" />
              {t.components.common.navbar.github}
            </a>
          </div>

          <div className="mt-auto border-t border-border pt-8 pb-4 flex flex-col items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {t.components.common.navbar.language}
            </span>
            <LanguageSwitcher />
            <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-4">
              {t.components.common.navbar.theme}
            </span>
            <ThemeSwitcher />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

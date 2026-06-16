import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { GithubIcon } from './GithubIcon';
import { useTranslation } from '@/lib/i18n/LanguageContext';

type TranslationType = ReturnType<typeof useTranslation>['t'];

export function DesktopLinks({ t }: { t: TranslationType }) {
  return (
    <div className="hidden md:flex gap-8 items-center absolute left-1/2 -translate-x-1/2 z-10">
      <Link
        href="/analyzer"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest whitespace-nowrap"
      >
        {t.components.common.navbar.dashboard}
      </Link>
      <Link
        href="/about"
        className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
      >
        {t.components.common.navbar.about}
      </Link>
    </div>
  );
}

export function DesktopActions({ t }: { t: TranslationType }) {
  return (
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
        title={t.components.common.navbar.github}
      >
        <GithubIcon className="h-4 w-4" />
        <span className="sr-only">{t.components.common.navbar.github}</span>
      </Button>
      <LanguageSwitcher />
      <ThemeSwitcher />
    </div>
  );
}

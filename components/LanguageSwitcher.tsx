'use client';

import { useTranslation } from '@/lib/i18n/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="w-9 h-9 border-primary/50 hover:bg-primary/20 text-primary"
            title={t.navbar.language}
          />
        }
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">{t.navbar.language}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-muted' : ''}
        >
          {t.languageSwitcher.en}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('it')}
          className={language === 'it' ? 'bg-muted' : ''}
        >
          {t.languageSwitcher.it}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

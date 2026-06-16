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
            title={t.components.common.navbar.language}
          />
        }
      >
        <Globe className="h-4 w-4" />
        <span className="sr-only">{t.components.common.navbar.language}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-muted' : ''}
        >
          {t.components.common.languageSwitcher.en}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('it')}
          className={language === 'it' ? 'bg-muted' : ''}
        >
          {t.components.common.languageSwitcher.it}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

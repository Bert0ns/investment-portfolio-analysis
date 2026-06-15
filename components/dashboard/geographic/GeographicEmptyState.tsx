import React from 'react';
import { Search, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface GeographicEmptyStateProps {
  query: string;
  hasResults: boolean;
}

export function GeographicEmptyState({ query, hasResults }: GeographicEmptyStateProps) {
  const { t } = useTranslation();

  if (query.length > 0 && !hasResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
        <MapPin className="w-12 h-12 mb-4" />
        <p>
          {t.deepDiveTab.noExposureFound} &quot;{query}&quot;
        </p>
      </div>
    );
  }

  if (query.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60 mt-12">
        <Search className="w-12 h-12 mb-4" />
        <p>{t.deepDiveTab.typeCountryInstruction}</p>
      </div>
    );
  }

  return null;
}

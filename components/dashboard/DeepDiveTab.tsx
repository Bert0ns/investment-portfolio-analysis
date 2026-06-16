import React from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { EtfConfig } from '@/lib/types';

import { GeographicSearch } from './geographic/GeographicSearch';
import { CompanySearch } from './company/CompanySearch';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface DeepDiveTabProps {
  etfs: EtfConfig[];
}

export function DeepDiveTab({ etfs }: DeepDiveTabProps) {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useLocalStorage<'company' | 'geo'>(
    'deepdive_tab_active',
    'company'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4 gap-3">
        <div className="bg-muted p-1 rounded-lg inline-flex">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${activeTab === 'company' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t.pages.analyzer.dashboard.tabs.deepDiveTab.companyTab}
          </button>
          <button
            onClick={() => setActiveTab('geo')}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${activeTab === 'geo' ? 'bg-background shadow text-foreground' : 'text-muted-foreground'}`}
          >
            {t.pages.analyzer.dashboard.tabs.deepDiveTab.geographicTab}
          </button>
        </div>
      </div>

      {activeTab === 'geo' ? (
        <GeographicSearch etfs={etfs} />
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CompanySearch etfs={etfs} />
        </div>
      )}
    </div>
  );
}

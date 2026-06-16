'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { dictionaries, Language, Dictionary } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const stored = localStorage.getItem('app_language') as Language;
    if (stored && (stored === 'en' || stored === 'it')) {
      setLanguage(stored);
    } else {
      const browserLang = navigator.language.startsWith('it') ? 'it' : 'en';
      setLanguage(browserLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app_language', lang);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t: dictionaries[language],
  };

  // Prevent hydration mismatch by not rendering translation until mounted
  if (!mounted) {
    return (
      <LanguageContext.Provider
        value={{ language: 'en', setLanguage: handleSetLanguage, t: dictionaries.en }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

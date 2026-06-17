import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface VoronoiLoaderProps {
  isCalculating: boolean;
}

export function VoronoiLoader({ isCalculating }: VoronoiLoaderProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isCalculating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-sm rounded-md"
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <span className="text-sm font-mono text-primary animate-pulse">
            {t.pages.analyzer.dashboard.tabs.fundDetailsTab.voronoiCalculating}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

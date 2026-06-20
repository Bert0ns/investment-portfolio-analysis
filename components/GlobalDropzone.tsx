'use client';

import { useState, useEffect, ReactNode } from 'react';
import { DownloadCloud } from 'lucide-react';
import {
  importPortfolioFromLens,
  importPortfolioFromSmartPNG,
} from '@/lib/utils/portfolio-sharing';
import { toast } from 'sonner';
import { EtfConfig } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface GlobalDropzoneProps {
  children: ReactNode;
  onImport: (etfs: EtfConfig[]) => void;
}

export function GlobalDropzone({ children, onImport }: GlobalDropzoneProps) {
  const { t } = useTranslation();
  const n = t.components.common.notifications;
  const s = t.components.common.sharePortfolio;

  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      // If the related target is null, we left the window
      if (!e.relatedTarget) {
        setIsDragging(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];

      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error(n.importFailed, { description: 'File size exceeds the 5MB limit.' });
        return;
      }

      try {
        let etfs: EtfConfig[] = [];
        if (file.name.endsWith('.lens')) {
          etfs = await importPortfolioFromLens(file);
        } else if (file.type === 'image/png') {
          etfs = await importPortfolioFromSmartPNG(file);
        } else {
          return; // Ignore other files (might be CSVs handled elsewhere)
        }

        if (etfs.length > 0) {
          onImport(etfs);
          toast.success(n.importSuccess, {
            description: n.importSuccessDesc + file.name,
          });
        }
      } catch (err) {
        const error = err as Error;
        toast.error(n.importFailed, {
          description: error.message || n.importFailedDesc,
        });
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onImport, n.importFailed, n.importFailedDesc, n.importSuccess, n.importSuccessDesc]);

  return (
    <>
      {children}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary">
          <div className="flex flex-col items-center gap-4 text-primary pointer-events-none">
            <DownloadCloud size={64} className="animate-bounce" />
            <h2 className="text-3xl font-bold tracking-widest uppercase text-center">
              {s.dropTitle} <br />
              <span className="text-sm opacity-70">{s.dropSubtitle}</span>
            </h2>
          </div>
        </div>
      )}
    </>
  );
}

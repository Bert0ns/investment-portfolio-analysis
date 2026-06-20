'use client';

import { useState, useEffect, ReactNode } from 'react';
import { DownloadCloud } from 'lucide-react';
import {
  importPortfolioFromLens,
  importPortfolioFromSmartPNG,
} from '@/lib/utils/portfolio-sharing';
import { toast } from 'sonner';
import { EtfConfig } from '@/lib/types';

interface GlobalDropzoneProps {
  children: ReactNode;
  onImport: (etfs: EtfConfig[]) => void;
}

export function GlobalDropzone({ children, onImport }: GlobalDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
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
          toast.success('Portfolio Loaded', {
            description: 'Successfully imported from ' + file.name,
          });
        }
      } catch (err) {
        const error = err as Error;
        toast.error('Import failed', {
          description: error.message || 'Could not parse portfolio file.',
        });
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onImport]);

  return (
    <>
      {children}
      {isDragging && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-dashed border-primary">
          <div className="flex flex-col items-center gap-4 text-primary pointer-events-none">
            <DownloadCloud size={64} className="animate-bounce" />
            <h2 className="text-3xl font-bold tracking-widest uppercase text-center">
              Drop Smart Image or .lens Cartridge <br />
              <span className="text-sm opacity-70">to load portfolio</span>
            </h2>
          </div>
        </div>
      )}
    </>
  );
}

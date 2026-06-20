'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import {
  importPortfolioFromLens,
  importPortfolioFromSmartPNG,
} from '@/lib/utils/portfolio-sharing';
import { toast } from 'sonner';
import { EtfConfig } from '@/lib/types';

interface ImportPortfolioButtonProps {
  onImport: (etfs: EtfConfig[]) => void;
}

export function ImportPortfolioButton({ onImport }: ImportPortfolioButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      let etfs: EtfConfig[] = [];
      if (file.name.endsWith('.lens')) {
        etfs = await importPortfolioFromLens(file);
      } else if (file.type === 'image/png') {
        etfs = await importPortfolioFromSmartPNG(file);
      } else {
        toast.error('Invalid file type', {
          description: 'Please select a .lens file or a Smart PNG.',
        });
        return;
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

    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".lens,image/png"
        className="hidden"
      />
      <Button
        variant="outline"
        className="gap-2 shrink-0 border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
        onClick={() => fileInputRef.current?.click()}
      >
        <Download size={16} className="rotate-180" />
        Import
      </Button>
    </>
  );
}

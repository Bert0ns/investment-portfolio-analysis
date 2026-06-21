'use client';

import { useRef, useState, useMemo } from 'react';
import { EtfConfig } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Share2, Download, FileJson } from 'lucide-react';
import { toPng } from 'html-to-image';
import { exportPortfolioToLens, exportPortfolioToSmartPNG } from '@/lib/utils/portfolio-sharing';
import { toast } from 'sonner';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { PortfolioTradingCard } from './PortfolioTradingCard';

interface SharePortfolioDialogProps {
  etfs: EtfConfig[];
}

export function SharePortfolioDialog({ etfs }: SharePortfolioDialogProps) {
  const { t } = useTranslation();
  const n = t.components.common.notifications;
  const s = t.components.common.sharePortfolio;

  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const topSectors = useMemo(() => {
    return Array.from(
      etfs.reduce((acc, etf) => {
        etf.holdings.forEach((h) => {
          acc.set(h.sector, (acc.get(h.sector) || 0) + h.weight * (etf.globalWeight / 100));
        });
        return acc;
      }, new Map<string, number>())
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [etfs]);

  const handleExportPNG = async () => {
    if (!cardRef.current) return;
    try {
      setIsExporting(true);
      // Generate the visual PNG
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High res for trading card
        style: { transform: 'scale(1)', margin: '0' },
      });

      // Inject the compressed binary state into the PNG tEXt chunk
      const smartBlob = exportPortfolioToSmartPNG(etfs, dataUrl);

      // Download
      const url = URL.createObjectURL(smartBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `capital-lens-portfolio.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(n.exportSmartSuccess, { description: n.exportSmartSuccessDesc });
    } catch (err) {
      console.error(err);
      toast.error(n.exportFailed, { description: n.exportFailedDescPNG });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportLens = () => {
    try {
      const blob = exportPortfolioToLens(etfs);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-portfolio.lens`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(n.exportLensSuccess, { description: n.exportLensSuccessDesc });
    } catch (err) {
      console.error(err);
      toast.error(n.exportFailed, { description: n.exportFailedDescLens });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="gap-2 shrink-0 h-auto py-3 px-4 rounded-xl font-semibold border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            <Share2 size={16} />
            {s.share}
          </Button>
        }
      />
      <DialogContent className="max-w-md bg-background border-primary/20 p-6 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-wider text-foreground">
            {s.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {/* The Trading Card */}
          <PortfolioTradingCard
            ref={cardRef}
            etfs={etfs}
            topSectors={topSectors}
            strings={{
              profile: s.profile,
              allocation: s.allocation,
              topSectorsStr: s.topSectors,
              smartImageDesc: s.smartImageDesc,
            }}
          />

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="w-full gap-2 bg-primary hover:bg-primary/80 text-primary-foreground text-sm font-bold shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <Download size={16} />
              {isExporting ? s.btnGenerating : s.btnDownloadPng}
            </Button>

            <Button
              onClick={handleExportLens}
              variant="outline"
              className="w-full gap-2 border-border/50 text-muted-foreground hover:text-foreground"
            >
              <FileJson size={16} />
              {s.btnDownloadLens}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">{s.fallbackDesc}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

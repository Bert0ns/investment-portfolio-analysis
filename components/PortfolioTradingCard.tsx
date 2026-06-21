import { forwardRef } from 'react';
import { EtfConfig } from '@/lib/types';

interface PortfolioTradingCardProps {
  etfs: EtfConfig[];
  topSectors: [string, number][];
  strings: {
    profile: string;
    allocation: string;
    topSectorsStr: string;
    smartImageDesc: string;
  };
}

export const PortfolioTradingCard = forwardRef<HTMLDivElement, PortfolioTradingCardProps>(
  ({ etfs, topSectors, strings }, ref) => {
    return (
      <div
        ref={ref}
        className="w-full aspect-[3/4] rounded-xl overflow-hidden relative border border-primary/30 bg-card flex flex-col justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,1) 0%, rgba(30,41,59,1) 100%)',
        }}
      >
        {/* Cyberpunk Grid Background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        {/* Header */}
        <div className="p-6 relative z-10">
          <div className="text-xs font-bold text-primary tracking-widest uppercase mb-1">
            Capital Lens
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">{strings.profile}</h3>
          <div className="h-1 w-12 bg-primary mt-3 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10 flex flex-col gap-4">
          <div className="bg-background/40 backdrop-blur-md rounded-lg p-3 border border-border/50">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {strings.allocation}
            </div>
            {etfs.map((e) => (
              <div
                key={e.id}
                className="flex justify-between items-center text-sm text-foreground/90 mb-1"
              >
                <span className="font-medium truncate mr-2">{e.name}</span>
                <span className="font-mono text-primary font-bold">
                  {e.globalWeight.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          <div className="bg-background/40 backdrop-blur-md rounded-lg p-3 border border-border/50">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {strings.topSectorsStr}
            </div>
            {topSectors.map((sector, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm text-foreground/90 mb-1"
              >
                <span className="truncate mr-2 text-xs">{sector[0]}</span>
                <span className="font-mono text-xs opacity-70">{sector[1].toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer / Barcode */}
        <div className="p-6 pt-0 relative z-10 flex justify-between items-end">
          <div className="font-mono text-[8px] text-primary/60 tracking-widest">
            {strings.smartImageDesc}
          </div>
          <div className="flex gap-1 h-6">
            {/* Fake barcode for aesthetic */}
            {[40, 70, 50, 90, 60, 45, 80, 55, 95, 65, 85, 75].map((val, i) => (
              <div key={i} className="bg-primary/40 w-1" style={{ height: `${val}%` }}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
);
PortfolioTradingCard.displayName = 'PortfolioTradingCard';

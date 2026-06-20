'use client';

import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function InstallPwaButton({
  className,
  variant = 'outline',
}: {
  className?: string;
  variant?: 'outline' | 'default' | 'ghost' | 'secondary' | 'link' | 'destructive';
}) {
  const { t } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  if (!deferredPrompt) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleInstallClick}
      className={
        className ||
        'hidden md:flex h-9 gap-2 border-primary/50 text-primary hover:bg-primary/20 bg-background/50 backdrop-blur-sm'
      }
    >
      <Download className="w-4 h-4" />
      <span className="uppercase tracking-widest text-xs font-bold">
        {t.components.common.navbar.installApp}
      </span>
    </Button>
  );
}

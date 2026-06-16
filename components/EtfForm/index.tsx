'use client';

import { EtfConfig } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEtfForm } from '@/hooks/useEtfForm';

import { EtfGeneralFields } from './EtfGeneralFields';
import { EtfTechnicalFields } from './EtfTechnicalFields';
import { EtfCsvUpload } from './EtfCsvUpload';

interface EtfFormProps {
  onAddEtf: (etf: EtfConfig) => void;
}

export default function EtfForm({ onAddEtf }: EtfFormProps) {
  const hook = useEtfForm(onAddEtf);
  const { state, actions, t } = hook;

  return (
    <Dialog open={state.open} onOpenChange={actions.setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full flex items-center justify-center gap-2 py-6 text-base shadow-sm" />
        }
      >
        <Plus size={20} /> {t.pages.analyzer.components.etfForm.addEtf}
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t.pages.analyzer.components.etfForm.addEtf}</DialogTitle>
          <DialogDescription>{t.pages.analyzer.components.etfForm.enterDetails}</DialogDescription>
        </DialogHeader>
        <form onSubmit={actions.handleSubmit} className="space-y-4 mt-2">
          <EtfGeneralFields hook={hook} />
          <EtfTechnicalFields hook={hook} />
          <EtfCsvUpload hook={hook} />

          <Button type="submit" disabled={state.isLoading} className="w-full mt-6">
            {state.isLoading
              ? t.pages.analyzer.components.etfForm.processing
              : t.pages.analyzer.components.etfForm.addToPortfolio}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

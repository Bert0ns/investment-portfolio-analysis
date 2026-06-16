import { useState } from 'react';
import { Issuer, EtfConfig, ReplicationMethod, UseOfProfit, Domicile } from '@/lib/types';
import { getCsvParser } from '@/lib/parsers';
import { toast } from 'sonner';
import { generateId } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export function useEtfForm(onAddEtf: (etf: EtfConfig) => void) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isin, setIsin] = useState('');
  const [issuer, setIssuer] = useState<Issuer>('iShares');
  const [ter, setTer] = useState('');

  const [replicationMethod, setReplicationMethod] = useState<ReplicationMethod>('Physical');
  const [fundSize, setFundSize] = useState('');
  const [fundAge, setFundAge] = useState('');
  const [useOfProfit, setUseOfProfit] = useState<UseOfProfit>('Accumulating');
  const [domicile, setDomicile] = useState<Domicile>('Ireland');

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setIsin('');
    setTer('');
    setFundSize('');
    setFundAge('');
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !ter || !file || !fundSize || !fundAge) {
      toast.error(t.pages.analyzer.components.etfForm.missingFields, {
        description: t.pages.analyzer.components.etfForm.missingFieldsDesc,
      });
      return;
    }

    const terNumber = parseFloat(ter);
    const sizeNumber = parseFloat(fundSize);
    const ageNumber = parseFloat(fundAge);

    if (isNaN(terNumber) || terNumber < 0) {
      toast.error(t.pages.analyzer.components.etfForm.invalidTer, {
        description: t.pages.analyzer.components.etfForm.invalidTer,
      });
      return;
    }
    if (isNaN(sizeNumber) || sizeNumber < 0) {
      toast.error(t.pages.analyzer.components.etfForm.invalidSize, {
        description: t.pages.analyzer.components.etfForm.invalidSize,
      });
      return;
    }
    if (isNaN(ageNumber) || ageNumber < 0) {
      toast.error(t.pages.analyzer.components.etfForm.invalidAge, {
        description: t.pages.analyzer.components.etfForm.invalidAge,
      });
      return;
    }

    setIsLoading(true);

    try {
      const parser = getCsvParser(issuer);
      const result = await parser.parse(file);

      if (result.errors.length > 0 && result.holdings.length === 0) {
        toast.error(t.pages.analyzer.components.etfForm.parseError, {
          description: `${t.pages.analyzer.components.etfForm.parseError}: ${result.errors[0]}`,
        });
        setIsLoading(false);
        return;
      }

      if (result.holdings.length === 0) {
        toast.error(t.pages.analyzer.components.etfForm.emptyFile, {
          description: t.pages.analyzer.components.etfForm.emptyFileDesc,
        });
        setIsLoading(false);
        return;
      }

      if (result.errors.length > 0) {
        toast.warning(t.pages.analyzer.components.etfForm.parsedWithWarnings, {
          description: `${t.pages.analyzer.components.etfForm.parsedWithWarningsDesc} ${result.errors.join('. ')}`,
        });
      }

      const newEtf: EtfConfig = {
        id: generateId(),
        name,
        isin,
        issuer,
        ter: terNumber,
        globalWeight: 0,
        holdings: result.holdings,
        replicationMethod,
        fundSize: sizeNumber,
        fundAge: ageNumber,
        useOfProfit,
        domicile,
      };

      onAddEtf(newEtf);
      resetForm();
      setOpen(false); // Close dialog on success

      toast.success(t.pages.analyzer.components.etfForm.etfAdded, {
        description: `${name} has been successfully added to your portfolio.`,
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred while parsing the CSV.';
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    state: {
      open,
      name,
      isin,
      issuer,
      ter,
      replicationMethod,
      fundSize,
      fundAge,
      useOfProfit,
      domicile,
      isLoading,
    },
    actions: {
      setOpen,
      setName,
      setIsin,
      setIssuer,
      setTer,
      setReplicationMethod,
      setFundSize,
      setFundAge,
      setUseOfProfit,
      setDomicile,
      setFile,
      handleSubmit,
    },
    t,
  };
}

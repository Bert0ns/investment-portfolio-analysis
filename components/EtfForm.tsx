'use client';

import { useState } from 'react';
import { Issuer, EtfConfig, ReplicationMethod, UseOfProfit, Domicile } from '../lib/types';
import { getCsvParser } from '../lib/parsers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface EtfFormProps {
  onAddEtf: (etf: EtfConfig) => void;
}

export default function EtfForm({ onAddEtf }: EtfFormProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [isin, setIsin] = useState('');
  const [issuer, setIssuer] = useState<Issuer>('iShares');
  const [ter, setTer] = useState('');

  // New Fields
  const [replicationMethod, setReplicationMethod] = useState<ReplicationMethod>('Physical');
  const [fundSize, setFundSize] = useState('');
  const [fundAge, setFundAge] = useState('');
  const [useOfProfit, setUseOfProfit] = useState<UseOfProfit>('Accumulating');
  const [domicile, setDomicile] = useState<Domicile>('Ireland');

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !ter || !file || !fundSize || !fundAge) {
      toast.error('Missing fields', {
        description: 'Please fill all fields and upload a CSV file.',
      });
      return;
    }

    const terNumber = parseFloat(ter);
    const sizeNumber = parseFloat(fundSize);
    const ageNumber = parseFloat(fundAge);

    if (isNaN(terNumber) || terNumber < 0) {
      toast.error('Invalid TER', { description: 'Please enter a valid TER.' });
      return;
    }
    if (isNaN(sizeNumber) || sizeNumber < 0) {
      toast.error('Invalid Fund Size', { description: 'Please enter a valid Fund Size.' });
      return;
    }
    if (isNaN(ageNumber) || ageNumber < 0) {
      toast.error('Invalid Fund Age', { description: 'Please enter a valid Fund Age.' });
      return;
    }

    setIsLoading(true);

    try {
      const parser = getCsvParser(issuer);
      const result = await parser.parse(file);

      if (result.errors.length > 0 && result.holdings.length === 0) {
        toast.error('Parse Error', { description: `Failed to parse CSV: ${result.errors[0]}` });
        setIsLoading(false);
        return;
      }

      if (result.holdings.length === 0) {
        toast.error('Empty File', {
          description: 'No valid holdings found in the CSV. Please check the file format.',
        });
        setIsLoading(false);
        return;
      }

      const newEtf: EtfConfig = {
        id: crypto.randomUUID(),
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

      // Reset form
      setName('');
      setIsin('');
      setTer('');
      setFundSize('');
      setFundAge('');
      setFile(null);
      setOpen(false); // Close dialog on success

      toast.success('ETF Added', {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="w-full flex items-center justify-center gap-2 py-6 text-base shadow-sm" />
        }
      >
        <Plus size={20} /> Add New ETF
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New ETF</DialogTitle>
          <DialogDescription>
            Enter the ETF details and upload its holdings CSV to add it to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="etf-name">ETF Name / Ticker</Label>
              <Input
                id="etf-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., S&P 500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="etf-isin">ISIN Code</Label>
              <Input
                id="etf-isin"
                type="text"
                value={isin}
                onChange={(e) => setIsin(e.target.value)}
                placeholder="e.g., IE00BK5BQW10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Provider</Label>
              <Select value={issuer} onValueChange={(val) => setIssuer(val as Issuer)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iShares">iShares</SelectItem>
                  <SelectItem value="Vanguard">Vanguard</SelectItem>
                  <SelectItem value="Amundi">Amundi</SelectItem>
                  <SelectItem value="Lyxor">Lyxor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ter">TER (%)</Label>
              <Input
                id="ter"
                type="number"
                step="0.01"
                value={ter}
                onChange={(e) => setTer(e.target.value)}
                placeholder="e.g., 0.22"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Replication Method</Label>
              <Select
                value={replicationMethod}
                onValueChange={(val) => setReplicationMethod(val as ReplicationMethod)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Physical">Physical</SelectItem>
                  <SelectItem value="Synthetic">Synthetic</SelectItem>
                  <SelectItem value="Optimized">Optimized</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Use of Profit</Label>
              <Select
                value={useOfProfit}
                onValueChange={(val) => setUseOfProfit(val as UseOfProfit)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accumulating">Accumulating</SelectItem>
                  <SelectItem value="Distributing">Distributing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fundSize">Fund Size ($M)</Label>
              <Input
                id="fundSize"
                type="number"
                value={fundSize}
                onChange={(e) => setFundSize(e.target.value)}
                placeholder="e.g., 5000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fundAge">Fund Age (Years)</Label>
              <Input
                id="fundAge"
                type="number"
                value={fundAge}
                onChange={(e) => setFundAge(e.target.value)}
                placeholder="e.g., 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Domicile</Label>
            <Select value={domicile} onValueChange={(val) => setDomicile(val as Domicile)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ireland">Ireland</SelectItem>
                <SelectItem value="Luxembourg">Luxembourg</SelectItem>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-file">Holdings CSV File</Label>
            <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs leading-relaxed border border-blue-200 dark:border-blue-800/50 mb-2 mt-1 shadow-sm">
              <strong className="block mb-1 text-blue-900 dark:text-blue-200">
                How to get the CSV file:
              </strong>
              Go to the ETF issuer&apos;s official website (e.g., iShares, Vanguard, Amundi), search
              for your ETF, and find the section containing the holdings/participations. Download
              the list as a <strong>CSV (UTF-8)</strong>. <br />
              <span className="text-red-700 dark:text-red-400 font-semibold mt-1 block">
                ⚠️ Do not edit or open the file in Excel before uploading! Just upload it directly
                as downloaded.
              </span>
            </div>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="cursor-pointer file:text-primary file:font-semibold"
            />
          </div>

          <Button type="submit" disabled={isLoading} className="w-full mt-6">
            {isLoading ? 'Processing...' : 'Add ETF to Portfolio'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

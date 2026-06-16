import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ReplicationMethod, UseOfProfit, Domicile } from '@/lib/types';
import { useEtfForm } from '@/hooks/useEtfForm';

type EtfFormHook = ReturnType<typeof useEtfForm>;

export function EtfTechnicalFields({ hook }: { hook: EtfFormHook }) {
  const { state, actions, t } = hook;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.pages.analyzer.components.etfForm.replication}</Label>
          <Select
            value={state.replicationMethod}
            onValueChange={(val) => actions.setReplicationMethod(val as ReplicationMethod)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Physical">{t.data.etfProperties.Physical}</SelectItem>
              <SelectItem value="Synthetic">{t.data.etfProperties.Synthetic}</SelectItem>
              <SelectItem value="Optimized">{t.data.etfProperties.Optimized}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t.pages.analyzer.components.etfForm.useOfProfit}</Label>
          <Select
            value={state.useOfProfit}
            onValueChange={(val) => actions.setUseOfProfit(val as UseOfProfit)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Accumulating">{t.data.etfProperties.Accumulating}</SelectItem>
              <SelectItem value="Distributing">{t.data.etfProperties.Distributing}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fundSize">{t.pages.analyzer.components.etfForm.fundSize}</Label>
          <Input
            id="fundSize"
            type="number"
            inputMode="decimal"
            value={state.fundSize}
            onChange={(e) => actions.setFundSize(e.target.value)}
            placeholder="e.g., 5000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundAge">{t.pages.analyzer.components.etfForm.fundAge}</Label>
          <Input
            id="fundAge"
            type="number"
            inputMode="decimal"
            value={state.fundAge}
            onChange={(e) => actions.setFundAge(e.target.value)}
            placeholder="e.g., 5"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t.pages.analyzer.components.etfForm.domicile}</Label>
        <Select
          value={state.domicile}
          onValueChange={(val) => actions.setDomicile(val as Domicile)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ireland">{t.data.etfProperties.Ireland}</SelectItem>
            <SelectItem value="Luxembourg">{t.data.etfProperties.Luxembourg}</SelectItem>
            <SelectItem value="US">{t.data.etfProperties.US}</SelectItem>
            <SelectItem value="Other">{t.data.sectors.Other}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}

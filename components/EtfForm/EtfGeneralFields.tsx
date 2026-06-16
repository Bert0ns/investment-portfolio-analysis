import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Issuer } from '@/lib/types';
import { useEtfForm } from '@/hooks/useEtfForm';

type EtfFormHook = ReturnType<typeof useEtfForm>;

export function EtfGeneralFields({ hook }: { hook: EtfFormHook }) {
  const { state, actions, t } = hook;
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="etf-name">{t.pages.analyzer.components.etfForm.name}</Label>
          <Input
            id="etf-name"
            type="text"
            value={state.name}
            onChange={(e) => actions.setName(e.target.value)}
            placeholder="e.g., S&P 500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="etf-isin">{t.pages.analyzer.components.etfForm.isin}</Label>
          <Input
            id="etf-isin"
            type="text"
            value={state.isin}
            onChange={(e) => actions.setIsin(e.target.value)}
            placeholder="e.g., IE00BK5BQW10"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t.pages.analyzer.components.etfForm.provider}</Label>
          <Select value={state.issuer} onValueChange={(val) => actions.setIssuer(val as Issuer)}>
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
          <Label htmlFor="ter">{t.pages.analyzer.components.etfForm.ter}</Label>
          <Input
            id="ter"
            type="number"
            inputMode="decimal"
            step="0.01"
            value={state.ter}
            onChange={(e) => actions.setTer(e.target.value)}
            placeholder="e.g., 0.22"
          />
        </div>
      </div>
    </>
  );
}

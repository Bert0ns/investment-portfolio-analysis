import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEtfForm } from '@/hooks/useEtfForm';

type EtfFormHook = ReturnType<typeof useEtfForm>;

export function EtfCsvUpload({ hook }: { hook: EtfFormHook }) {
  const { actions, t } = hook;
  return (
    <div className="space-y-2">
      <Label htmlFor="csv-file">{t.pages.analyzer.components.etfForm.csvFile}</Label>
      <div className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-xs leading-relaxed border border-blue-200 dark:border-blue-800/50 mb-2 mt-1 shadow-sm">
        <strong className="block mb-1 text-blue-900 dark:text-blue-200">
          {t.pages.analyzer.components.etfForm.howToCsvTitle}
        </strong>
        {t.pages.analyzer.components.etfForm.howToCsvDesc} <strong>CSV (UTF-8)</strong>. <br />
        <span className="text-red-700 dark:text-red-400 font-semibold mt-1 block">
          {t.pages.analyzer.components.etfForm.csvWarning}
        </span>
      </div>
      <Input
        id="csv-file"
        type="file"
        accept=".csv"
        onChange={(e) => actions.setFile(e.target.files?.[0] || null)}
        className="cursor-pointer file:text-primary file:font-semibold"
      />
    </div>
  );
}

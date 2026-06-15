import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/LanguageContext';

export const DASHBOARD_TABS = [
  'Overview',
  'Fund Details',
  'Risk Analysis',
  'Deep Dive',
  '3D Visuals',
  'Savings Plan',
] as const;

export type DashboardTabType = (typeof DASHBOARD_TABS)[number];

interface DashboardTabsNavProps {
  activeTab: DashboardTabType;
  setActiveTab: (tab: DashboardTabType) => void;
}

export function DashboardTabsNav({ activeTab, setActiveTab }: DashboardTabsNavProps) {
  const { t } = useTranslation();

  const tabNames: Record<DashboardTabType, string> = {
    Overview: t.overviewTab.tabOverview,
    'Deep Dive': t.overviewTab.tabDeepDive,
    'Fund Details': t.overviewTab.tabFundDetails,
    'Risk Analysis': t.overviewTab.tabRiskAnalysis,
    'Savings Plan': t.overviewTab.tabSavingsPlan,
    '3D Visuals': t.overviewTab.tab3DVisuals,
  };

  return (
    <>
      <div className="md:hidden">
        <Select
          value={activeTab}
          onValueChange={(val) => {
            if (val) setActiveTab(val as DashboardTabType);
          }}
        >
          <SelectTrigger className="w-full text-base py-6 bg-muted/50 font-medium">
            <SelectValue placeholder="Select tab" />
          </SelectTrigger>
          <SelectContent>
            {DASHBOARD_TABS.map((tab) => (
              <SelectItem key={tab} value={tab} className="text-base py-3">
                {tabNames[tab]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden md:flex gap-1 overflow-x-auto whitespace-nowrap bg-muted/50 p-1.5 rounded-xl w-full shadow-sm scrollbar-thin">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-5 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm scale-100'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80 scale-95 hover:scale-100'
            }`}
          >
            {tabNames[tab]}
          </button>
        ))}
      </div>
    </>
  );
}

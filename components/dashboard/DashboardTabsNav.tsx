import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/lib/i18n/LanguageContext';

const DASHBOARD_TABS = [
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
    Overview: t.pages.analyzer.dashboard.tabs.overviewTab.tabOverview,
    'Deep Dive': t.pages.analyzer.dashboard.tabs.overviewTab.tabDeepDive,
    'Fund Details': t.pages.analyzer.dashboard.tabs.overviewTab.tabFundDetails,
    'Risk Analysis': t.pages.analyzer.dashboard.tabs.overviewTab.tabRiskAnalysis,
    'Savings Plan': t.pages.analyzer.dashboard.tabs.overviewTab.tabSavingsPlan,
    '3D Visuals': t.pages.analyzer.dashboard.tabs.overviewTab.tab3DVisuals,
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
          <SelectTrigger className="w-full text-base py-6 bg-background border-primary/30 ring-1 ring-primary/20 font-medium shadow-sm text-foreground">
            <SelectValue placeholder="Select tab">{tabNames[activeTab]}</SelectValue>
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
      <div className="hidden md:flex gap-2 overflow-x-auto whitespace-nowrap bg-muted/40 border border-border p-1.5 rounded-2xl w-full shadow-sm scrollbar-thin">
        {DASHBOARD_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm scale-100 ring-2 ring-primary/20'
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

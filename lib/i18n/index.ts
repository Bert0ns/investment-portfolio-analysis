// Auto-generated i18n barrel file

import en_landing from './locales/en/pages/landing.json';
import en_about from './locales/en/pages/about.json';
import en_analyzer from './locales/en/pages/analyzer/main.json';
import en_navbar from './locales/en/components/common/navbar.json';
import en_languageSwitcher from './locales/en/components/common/languageSwitcher.json';
import en_notifications from './locales/en/components/common/notifications.json';
import en_etfForm from './locales/en/pages/analyzer/components/etfForm.json';
import en_portfolioSliders from './locales/en/pages/analyzer/components/portfolioSliders.json';
import en_savingsPlan from './locales/en/pages/analyzer/components/savingsPlan.json';
import en_dashboard from './locales/en/pages/analyzer/dashboard/main.json';
import en_overviewTab from './locales/en/pages/analyzer/dashboard/tabs/overviewTab.json';
import en_fundDetailsTab from './locales/en/pages/analyzer/dashboard/tabs/fundDetailsTab.json';
import en_riskAnalysisTab from './locales/en/pages/analyzer/dashboard/tabs/riskAnalysisTab.json';
import en_deepDiveTab from './locales/en/pages/analyzer/dashboard/tabs/deepDiveTab.json';
import en_threeDVisuals from './locales/en/pages/analyzer/dashboard/tabs/threeDVisuals.json';
import en_charts from './locales/en/pages/analyzer/dashboard/widgets/charts.json';
import en_diversification from './locales/en/pages/analyzer/dashboard/widgets/diversification.json';
import en_sectors from './locales/en/data/sectors.json';
import en_countries from './locales/en/data/countries.json';
import en_etfProperties from './locales/en/data/etfProperties.json';

import it_landing from './locales/it/pages/landing.json';
import it_about from './locales/it/pages/about.json';
import it_analyzer from './locales/it/pages/analyzer/main.json';
import it_navbar from './locales/it/components/common/navbar.json';
import it_languageSwitcher from './locales/it/components/common/languageSwitcher.json';
import it_notifications from './locales/it/components/common/notifications.json';
import it_etfForm from './locales/it/pages/analyzer/components/etfForm.json';
import it_portfolioSliders from './locales/it/pages/analyzer/components/portfolioSliders.json';
import it_savingsPlan from './locales/it/pages/analyzer/components/savingsPlan.json';
import it_dashboard from './locales/it/pages/analyzer/dashboard/main.json';
import it_overviewTab from './locales/it/pages/analyzer/dashboard/tabs/overviewTab.json';
import it_fundDetailsTab from './locales/it/pages/analyzer/dashboard/tabs/fundDetailsTab.json';
import it_riskAnalysisTab from './locales/it/pages/analyzer/dashboard/tabs/riskAnalysisTab.json';
import it_deepDiveTab from './locales/it/pages/analyzer/dashboard/tabs/deepDiveTab.json';
import it_threeDVisuals from './locales/it/pages/analyzer/dashboard/tabs/threeDVisuals.json';
import it_charts from './locales/it/pages/analyzer/dashboard/widgets/charts.json';
import it_diversification from './locales/it/pages/analyzer/dashboard/widgets/diversification.json';
import it_sectors from './locales/it/data/sectors.json';
import it_countries from './locales/it/data/countries.json';
import it_etfProperties from './locales/it/data/etfProperties.json';

export const dictionaries = {
  en: {
    pages: {
      landing: en_landing,
      about: en_about,
      analyzer: {
        main: en_analyzer,
        components: {
          etfForm: en_etfForm,
          portfolioSliders: en_portfolioSliders,
          savingsPlan: en_savingsPlan,
        },
        dashboard: {
          main: en_dashboard,
          tabs: {
            overviewTab: en_overviewTab,
            fundDetailsTab: en_fundDetailsTab,
            riskAnalysisTab: en_riskAnalysisTab,
            deepDiveTab: en_deepDiveTab,
            threeDVisuals: en_threeDVisuals,
          },
          widgets: {
            charts: en_charts,
            diversification: en_diversification,
          },
        },
      },
    },
    components: {
      common: {
        navbar: en_navbar,
        languageSwitcher: en_languageSwitcher,
        notifications: en_notifications,
      },
    },
    data: {
      sectors: en_sectors,
      countries: en_countries,
      etfProperties: en_etfProperties,
    },
  },
  it: {
    pages: {
      landing: it_landing,
      about: it_about,
      analyzer: {
        main: it_analyzer,
        components: {
          etfForm: it_etfForm,
          portfolioSliders: it_portfolioSliders,
          savingsPlan: it_savingsPlan,
        },
        dashboard: {
          main: it_dashboard,
          tabs: {
            overviewTab: it_overviewTab,
            fundDetailsTab: it_fundDetailsTab,
            riskAnalysisTab: it_riskAnalysisTab,
            deepDiveTab: it_deepDiveTab,
            threeDVisuals: it_threeDVisuals,
          },
          widgets: {
            charts: it_charts,
            diversification: it_diversification,
          },
        },
      },
    },
    components: {
      common: {
        navbar: it_navbar,
        languageSwitcher: it_languageSwitcher,
        notifications: it_notifications,
      },
    },
    data: {
      sectors: it_sectors,
      countries: it_countries,
      etfProperties: it_etfProperties,
    },
  },
};

export type Language = 'en' | 'it';
export type Dictionary = typeof dictionaries.en;

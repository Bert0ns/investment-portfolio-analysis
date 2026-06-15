import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import WorldMap from 'react-svg-worldmap';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import { MapControls } from './MapControls';
import { MAP_COLORS, MAP_CONFIG } from './mapConstants';

interface GeographicMapProps {
  mapData: { country: string; value: number }[];
  onCountryClick: (countryName: string) => void;
  selectedCountry?: string;
}

export function GeographicMap({ mapData, onCountryClick, selectedCountry }: GeographicMapProps) {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <div className="w-full h-full py-0 px-0 bg-muted/30 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10 pl-6 lg:pl-0">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-bold tracking-widest text-sm text-primary uppercase">
          {t.deepDiveTab.globalExposure}
        </h3>
      </div>
      <div className="w-full h-full pointer-events-auto px-2 md:px-8 flex justify-center items-center [&_figure]:w-full [&_svg]:w-full [&_svg]:h-auto">
        <TransformWrapper
          initialScale={MAP_CONFIG.initialScale}
          minScale={MAP_CONFIG.minScale}
          maxScale={MAP_CONFIG.maxScale}
          wheel={{ wheelDisabled: true }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative w-full flex flex-col items-center">
              <MapControls zoomIn={zoomIn} zoomOut={zoomOut} resetTransform={resetTransform} />

              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div className="w-full flex justify-center items-center">
                  <WorldMap
                    color={MAP_COLORS.defaultFill}
                    backgroundColor="transparent"
                    borderColor={
                      resolvedTheme === 'theme-cyberpunk'
                        ? MAP_COLORS.darkThemeStroke
                        : MAP_COLORS.lightThemeStroke
                    }
                    strokeOpacity={MAP_CONFIG.strokeOpacity}
                    valueSuffix="%"
                    size="responsive"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={mapData as any}
                    onClickFunction={({ countryName }) => {
                      onCountryClick(countryName);
                    }}
                    styleFunction={(context) => {
                      const isSelected =
                        selectedCountry &&
                        context.countryName.toLowerCase() === selectedCountry.toLowerCase();

                      const cv = context.countryValue as number | undefined;
                      const isUnmapped = cv === undefined;
                      let opacityLevel = 0;

                      if (!isUnmapped) {
                        const range = context.maxValue - context.minValue;
                        opacityLevel =
                          range > 0 ? 0.2 + 0.6 * ((cv - context.minValue) / range) : 0.8;
                      }

                      if (Number.isNaN(opacityLevel)) opacityLevel = 0.8;

                      return {
                        fill: isSelected ? MAP_COLORS.selectedFill : MAP_COLORS.defaultFill,
                        fillOpacity: isSelected ? 1 : opacityLevel,
                        stroke:
                          resolvedTheme === 'theme-cyberpunk'
                            ? MAP_COLORS.darkThemeStroke
                            : MAP_COLORS.lightThemeStroke,
                        strokeWidth: MAP_CONFIG.strokeWidth,
                        strokeOpacity: MAP_CONFIG.strokeOpacity,
                        cursor: 'pointer',
                      };
                    }}
                  />
                </div>
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      </div>
      <p className="text-xs text-muted-foreground absolute bottom-4 text-center w-full pointer-events-none">
        {t.deepDiveTab.mapInstruction}
      </p>
    </div>
  );
}

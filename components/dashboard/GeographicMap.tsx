import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Globe, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useTheme } from 'next-themes';
import WorldMap from 'react-svg-worldmap';

interface GeographicMapProps {
  mapData: { country: string; value: number }[];
  onCountryClick: (countryName: string) => void;
}

export function GeographicMap({ mapData, onCountryClick }: GeographicMapProps) {
  const { resolvedTheme } = useTheme();

  return (
    <div className="w-full py-0 px-0 border-b border-border bg-muted/30 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
      <div className="absolute top-6 left-6 flex items-center gap-2 z-10 pl-6 lg:pl-0">
        <Globe className="w-5 h-5 text-primary" />
        <h3 className="font-bold tracking-widest text-sm text-primary uppercase">
          Global Exposure
        </h3>
      </div>
      <div className="w-full pointer-events-auto px-2 md:px-8 flex justify-center [&_figure]:w-full [&_svg]:w-full [&_svg]:h-auto">
        <TransformWrapper initialScale={2.8} minScale={1.8} maxScale={4} wheel={{ step: 0.001 }}>
          {({ zoomIn, zoomOut, resetTransform }) => (
            <div className="relative w-full flex flex-col items-center">
              <div className="absolute top-0 right-4 z-20 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-1.5 rounded-lg border border-border shadow-sm">
                <button
                  onClick={() => zoomIn()}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => zoomOut()}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => resetTransform()}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors"
                  title="Reset View"
                >
                  <Maximize className="w-4 h-4 text-foreground" />
                </button>
              </div>

              <TransformComponent
                wrapperStyle={{ width: '100%', minHeight: '450px' }}
                contentStyle={{
                  width: '100%',
                  minHeight: '450px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <div className="w-full flex justify-center items-center">
                  <WorldMap
                    color="#3b82f6"
                    backgroundColor="transparent"
                    borderColor={resolvedTheme === 'dark' ? '#ffffff' : '#0f172a'}
                    strokeOpacity={0.9}
                    valueSuffix="%"
                    size="responsive"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={mapData as any}
                    onClickFunction={({ countryName }) => {
                      onCountryClick(countryName);
                    }}
                  />
                </div>
              </TransformComponent>
            </div>
          )}
        </TransformWrapper>
      </div>
      <p className="text-xs text-muted-foreground absolute bottom-4 text-center w-full pointer-events-none">
        Click any highlighted country to filter. Scroll/pinch to zoom, drag to pan.
      </p>
    </div>
  );
}

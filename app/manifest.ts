import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Capital Lens',
    short_name: 'CapLens',
    description: 'Analyze and visualize your custom ETF portfolio.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon.svg',
        sizes: '192x192 512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
    // The share_target property is valid in web app manifests but might be missing
    // from the Next.js TypeScript definitions, so we cast to any.
    ...({
      share_target: {
        action: '/share-target',
        method: 'POST',
        enctype: 'multipart/form-data',
        params: {
          title: 'title',
          text: 'text',
          url: 'url',
          files: [
            {
              name: 'portfolioFile',
              accept: ['.csv', '.lens'],
            },
          ],
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any),
  };
}

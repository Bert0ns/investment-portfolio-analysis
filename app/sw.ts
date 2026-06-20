import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

import { setItem } from '@/lib/indexeddb';

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(
      (async () => {
        try {
          const formData = await event.request.formData();
          const file = formData.get('portfolioFile');

          if (file && file instanceof File) {
            // Store the File object directly to support binary .lens files
            await setItem('shared_portfolio_file', {
              file: file,
              timestamp: Date.now(),
            });
          }

          // Redirect to the home page with a query param indicating a shared file is pending
          return Response.redirect('/?shared=true', 303);
        } catch (error) {
          console.error('Error handling share target POST:', error);
          return Response.redirect('/?shared=error', 303);
        }
      })()
    );
  }
});
serwist.addEventListeners();

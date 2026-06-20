'use client';

import { useEffect } from 'react';

export default function SerwistInit() {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'development') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    } else if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
      console.log('Service Worker registration skipped in development mode.');
    }
  }, []);

  return null;
}

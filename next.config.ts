import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = '1';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  turbopack: {},
  /* config options here */
  // allowedDevOrigins is needed for loca.lt development
  allowedDevOrigins: process.env.ALLOWED_DEV_ORIGINS
    ? process.env.ALLOWED_DEV_ORIGINS.split(',')
    : [],
};

export default withSerwist(nextConfig);

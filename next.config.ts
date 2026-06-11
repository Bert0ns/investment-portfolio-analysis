import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins is needed for loca.lt development
  allowedDevOrigins: ['cold-otters-accept.loca.lt', 'berto-dev.loca.lt'],
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  // @ts-ignore - allowedDevOrigins might not be typed depending on the exact minor version
  allowedDevOrigins: ['cold-otters-accept.loca.lt', 'berto-dev.loca.lt'],
};

export default nextConfig;

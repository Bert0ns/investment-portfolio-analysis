import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: 'v8',
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!components/ui/**', // Exclude shadcn UI components from coverage since they are external
  ],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/$1',
    '^d3-hierarchy$': '<rootDir>/__mocks__/d3-hierarchy.js',
    '^d3-voronoi-treemap$': '<rootDir>/__mocks__/d3-voronoi-treemap.js',
  },
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
const getConfig = async () => {
  const nextJestConfig = await createJestConfig(config)();
  return {
    ...nextJestConfig,
    transformIgnorePatterns: ['/node_modules/(?!(d3-hierarchy|d3-voronoi-treemap)/)'],
  };
};

export default getConfig;

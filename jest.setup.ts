import '@testing-library/jest-dom';

// Mock matchMedia which is not implemented in JSDOM but needed by some UI libraries (like Recharts/Shadcn)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import React from 'react';

jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        OriginalModule.ResponsiveContainer,
        { width: 800, height: 800 },
        children
      ),
  };
});

// Mock the Slider component to prevent @base-ui/react from triggering async act(...) warnings during tests
jest.mock('@/components/ui/slider', () => {
  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Slider: ({ value, defaultValue, onValueChange, min, max, ...props }: any) => {
      const val = value !== undefined ? value[0] : defaultValue !== undefined ? defaultValue[0] : 0;
      return React.createElement('input', {
        type: 'range',
        'data-testid': 'mock-slider',
        min: min,
        max: max,
        value: val,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange: (e: any) => onValueChange?.([Number(e.target.value)]),
        ...props,
      });
    },
  };
});

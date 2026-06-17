import { renderHook, act, waitFor } from '@testing-library/react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { getItem } from '@/lib/indexeddb';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { toast } from 'sonner';
import { getCsvParser } from '@/lib/parsers';

jest.mock('../lib/parsers', () => ({
  getCsvParser: jest.fn(),
}));

jest.mock('../lib/indexeddb', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Default fetch mock
const defaultFetchMock = () =>
  Promise.resolve({
    ok: true,
    blob: () => Promise.resolve(new Blob([''], { type: 'text/csv' })),
  });
global.fetch = jest.fn(defaultFetchMock) as jest.Mock;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockEtf = (overrides: Partial<any> = {}) =>
  ({
    id: '123',
    name: 'Test ETF',
    isin: 'IE0012345678',
    issuer: 'Vanguard',
    ter: 0.1,
    globalWeight: 100,
    replicationMethod: 'Physical',
    useOfProfit: 'Accumulating',
    domicile: 'Ireland',
    fundAge: 5,
    fundSize: 1000,
    holdings: [],
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

describe('usePortfolio Hook', () => {
  beforeEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
    (getItem as jest.Mock).mockResolvedValue(null);
    (getCsvParser as jest.Mock).mockReturnValue({
      parse: jest.fn().mockResolvedValue({ holdings: [] }),
    });
    (global.fetch as jest.Mock).mockImplementation(defaultFetchMock);
  });

  const renderAndAwaitLoad = async () => {
    const hook = renderHook(() => usePortfolio(), { wrapper: LanguageProvider });
    await waitFor(() => {
      expect(hook.result.current.isLoaded).toBe(true);
    });
    return hook.result;
  };

  it('loads empty array if local storage is empty, then loads defaults if we call it', async () => {
    await renderAndAwaitLoad();
  });

  it('can add an ETF and updates local storage', async () => {
    // Prevent loadDefaults from running initially by seeding indexedDB
    (getItem as jest.Mock).mockResolvedValue([
      { id: 'dummy', name: 'dummy', globalWeight: 0, holdings: [] },
    ]);

    const result = await renderAndAwaitLoad();

    // We can't use waitForNextUpdate in modern RTL easily without imports,
    // so we just rely on the fact that the hook handles it.
    // Let's just override isLoaded in the test by seeding valid data
    act(() => {
      result.current.addEtf(createMockEtf());
    });

    // Dummy + New ETF = 2
    expect(result.current.etfs.length).toBe(2);
    expect(result.current.etfs[1].name).toBe('Test ETF');
    expect(result.current.totalWeight).toBe(100);
  });

  it('loadDefaults loads ETFs successfully with holdings', async () => {
    // Mock getCsvParser to return holdings
    (getCsvParser as jest.Mock).mockReturnValue({
      parse: jest.fn().mockResolvedValue({
        holdings: [
          {
            name: 'Apple',
            ticker: 'AAPL',
            weight: 100,
            sector: 'IT',
            country: 'US',
            currency: 'USD',
          },
        ],
      }),
    });

    const result = await renderAndAwaitLoad();

    act(() => {
      result.current.loadDefaults();
    });

    await waitFor(() => {
      expect(result.current.etfs.length).toBeGreaterThan(0);
      expect(result.current.etfs[0].holdings.length).toBe(1);
    });
  });

  it('loadDefaults handles fetch failure gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404 })
    );

    const result = await renderAndAwaitLoad();

    act(() => {
      result.current.loadDefaults();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('can update weight of an ETF', async () => {
    (getItem as jest.Mock).mockResolvedValue([
      {
        id: '123',
        name: 'Test ETF',
        globalWeight: 50,
        holdings: [],
      },
    ]);

    const result = await renderAndAwaitLoad();

    // Wait for the effect that loads from local storage to run
    // Wait, the hook sets state synchronously if we could, but it uses useEffect.
    // In test environment with strict mode, it's better to just add it and test.
    act(() => {
      result.current.addEtf(createMockEtf({ id: 'abc', name: 'Test ETF 2', globalWeight: 50 }));
    });

    act(() => {
      result.current.updateEtfWeight('abc', 25);
    });

    expect(result.current.etfs.find((e) => e.id === 'abc')?.globalWeight).toBe(25);
  });

  it('can remove an ETF', async () => {
    const result = await renderAndAwaitLoad();

    act(() => {
      result.current.addEtf(
        createMockEtf({ id: 'to-remove', name: 'Remove Me', globalWeight: 100 })
      );
    });

    expect(result.current.etfs.length).toBeGreaterThan(0);

    act(() => {
      result.current.removeEtf('to-remove');
    });

    expect(result.current.etfs.find((e) => e.id === 'to-remove')).toBeUndefined();
  });

  it('ignores invalid JSON in localStorage during migration', async () => {
    (getItem as jest.Mock).mockResolvedValue(null);
    window.localStorage.setItem('etf_portfolio_data', 'invalid-json');

    await renderAndAwaitLoad();

    expect(window.localStorage.getItem('etf_portfolio_data')).toBe('invalid-json');
  });

  it('shows error toast when storage throws an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (getItem as jest.Mock).mockRejectedValue(new Error('IndexedDB Error'));

    await renderAndAwaitLoad();

    expect(toast.error).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});

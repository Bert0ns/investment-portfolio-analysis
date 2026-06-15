import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useEtfForm } from '@/hooks/useEtfForm';
import { toast } from 'sonner';
import { getCsvParser } from '@/lib/parsers';
import { useTranslation } from '@/lib/i18n/LanguageContext';

// Mocks
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    warning: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock('../lib/parsers', () => ({
  getCsvParser: jest.fn(),
}));

jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fillForm = (result: any) => {
  result.current.actions.setName('Test');
  result.current.actions.setTer('0.1');
  result.current.actions.setFundSize('100');
  result.current.actions.setFundAge('5');
  result.current.actions.setFile(new File([''], 'test.csv'));
};

describe('useEtfForm', () => {
  const mockOnAddEtf = jest.fn();
  const mockParse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useTranslation as jest.Mock).mockReturnValue({
      t: {
        etfForm: {
          missingFields: 'missingFields',
          missingFieldsDesc: 'missingFieldsDesc',
          invalidTer: 'invalidTer',
          invalidSize: 'invalidSize',
          invalidAge: 'invalidAge',
          parseError: 'parseError',
          emptyFile: 'emptyFile',
          emptyFileDesc: 'emptyFileDesc',
          parsedWithWarnings: 'parsedWithWarnings',
          parsedWithWarningsDesc: 'parsedWithWarningsDesc',
          etfAdded: 'etfAdded',
        },
      },
    });

    (getCsvParser as jest.Mock).mockReturnValue({
      parse: mockParse,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitForm = async (result: any) => {
    await act(async () => {
      await result.current.actions.handleSubmit({
        preventDefault: jest.fn(),
      } as unknown as React.FormEvent<HTMLFormElement>);
    });
  };

  const renderFillAndSubmit = async () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));
    await act(async () => {
      fillForm(result);
    });
    await submitForm(result);
    return result;
  };

  it('initializes with default state', () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));
    expect(result.current.state.open).toBe(false);
    expect(result.current.state.name).toBe('');
    expect(result.current.state.issuer).toBe('iShares');
  });

  it('updates form fields', () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    act(() => {
      result.current.actions.setName('Test ETF');
      result.current.actions.setTer('0.5');
    });

    expect(result.current.state.name).toBe('Test ETF');
    expect(result.current.state.ter).toBe('0.5');
  });

  it('shows error if required fields are missing', async () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    await submitForm(result);

    expect(toast.error).toHaveBeenCalledWith('missingFields', expect.any(Object));
    expect(mockOnAddEtf).not.toHaveBeenCalled();
  });

  it('shows error if numbers are invalid', async () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    await act(async () => {
      fillForm(result);
      result.current.actions.setTer('invalid'); // Override to invalid TER
    });

    await submitForm(result);

    expect(toast.error).toHaveBeenCalledWith('invalidTer', expect.any(Object));
  });

  it('handles CSV parsing errors', async () => {
    mockParse.mockResolvedValueOnce({
      holdings: [],
      errors: ['Invalid CSV format'],
    });

    await renderFillAndSubmit();

    expect(toast.error).toHaveBeenCalledWith(
      'parseError',
      expect.objectContaining({
        description: expect.stringContaining('Invalid CSV format'),
      })
    );
  });

  it('successfully adds ETF and resets form', async () => {
    mockParse.mockResolvedValueOnce({
      holdings: [
        {
          ticker: 'AAPL',
          name: 'Apple',
          weight: 100,
          sector: 'IT',
          country: 'US',
          currency: 'USD',
        },
      ],
      errors: [],
    });

    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    await act(async () => {
      fillForm(result);
      result.current.actions.setIsin('US123456');
    });

    await submitForm(result);

    expect(mockOnAddEtf).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test',
        isin: 'US123456',
        ter: 0.1,
        fundSize: 100,
        fundAge: 5,
        holdings: expect.any(Array),
      })
    );

    expect(toast.success).toHaveBeenCalledWith('etfAdded', expect.any(Object));
    expect(result.current.state.name).toBe('');
  });

  it('shows warning if parsed with warnings', async () => {
    mockParse.mockResolvedValueOnce({
      holdings: [
        {
          ticker: 'AAPL',
          name: 'Apple',
          weight: 100,
          sector: 'IT',
          country: 'US',
          currency: 'USD',
        },
      ],
      errors: ['Some random warning'],
    });

    await renderFillAndSubmit();

    expect(toast.warning).toHaveBeenCalledWith(
      'parsedWithWarnings',
      expect.objectContaining({
        description: expect.stringContaining('Some random warning'),
      })
    );
    expect(mockOnAddEtf).toHaveBeenCalled();
  });

  it('handles unexpected exceptions', async () => {
    mockParse.mockRejectedValueOnce(new Error('Unexpected disaster'));

    await renderFillAndSubmit();

    expect(toast.error).toHaveBeenCalledWith(
      'Error',
      expect.objectContaining({
        description: 'Unexpected disaster',
      })
    );
  });

  it('shows error if fund size is invalid', async () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    await act(async () => {
      fillForm(result);
      result.current.actions.setFundSize('-10'); // Invalid fund size
    });

    await submitForm(result);

    expect(toast.error).toHaveBeenCalledWith('invalidSize', expect.any(Object));
  });

  it('shows error if fund age is invalid', async () => {
    const { result } = renderHook(() => useEtfForm(mockOnAddEtf));

    await act(async () => {
      fillForm(result);
      result.current.actions.setFundAge('-1'); // Invalid fund age
    });

    await submitForm(result);

    expect(toast.error).toHaveBeenCalledWith('invalidAge', expect.any(Object));
  });

  it('shows error if parsed file is completely empty (no holdings)', async () => {
    mockParse.mockResolvedValueOnce({
      holdings: [],
      errors: [], // No errors, but no holdings either
    });

    await renderFillAndSubmit();

    expect(toast.error).toHaveBeenCalledWith(
      'emptyFile',
      expect.objectContaining({
        description: 'emptyFileDesc',
      })
    );
  });
});

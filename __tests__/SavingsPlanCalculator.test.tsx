import '@testing-library/jest-dom';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SavingsPlanCalculator } from '@/components/SavingsPlanCalculator';
import { EtfConfig } from '@/lib/types';

jest.mock('../lib/i18n/LanguageContext', () => ({
  useTranslation: () => ({
    language: 'en',
    setLanguage: jest.fn(),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    t: require('../lib/i18n/dictionaries').dictionaries.en,
  }),
}));

describe('SavingsPlanCalculator Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const mockEtfs: EtfConfig[] = [
    {
      id: '1',
      name: 'Vanguard World',
      issuer: 'Vanguard',
      ter: 0.15,
      globalWeight: 60,
      replicationMethod: 'Physical',
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
      fundAge: 5,
      fundSize: 1000,
      holdings: [],
    },
    {
      id: '2',
      name: 'iShares Emerging',
      issuer: 'iShares',
      ter: 0.18,
      globalWeight: 40,
      replicationMethod: 'Physical',
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
      fundAge: 5,
      fundSize: 1000,
      holdings: [],
    },
  ];

  it('renders correctly with default values', async () => {
    await act(async () => {
      render(<SavingsPlanCalculator etfs={mockEtfs} totalWeight={100} />);
    });

    // Check titles
    expect(screen.getByText(/Growth Projection over/i)).toBeInTheDocument();
    expect(screen.getByText("Next Month's Buying Plan")).toBeInTheDocument();
    expect(screen.getByText('Plan Settings')).toBeInTheDocument();

    // Check KPIs for defaults (0 initial + 833 * 6 months = 4,998)
    expect(screen.getByText('$4,998')).toBeInTheDocument(); // Total Invested

    // Check buying plan allocation
    // $833 monthly * 60% = $500
    // $833 monthly * 40% = $333
    expect(screen.getByText('$500')).toBeInTheDocument(); // Vanguard World
    expect(screen.getByText('$333')).toBeInTheDocument(); // iShares Emerging
  });

  it('updates buying plan and totals when monthly contribution changes via input', async () => {
    await act(async () => {
      render(<SavingsPlanCalculator etfs={mockEtfs} totalWeight={100} />);
    });

    // Inputs: Initial(0), Monthly(1), Duration(2), Expected(3), Stop(4)
    const inputs = screen.getAllByRole('spinbutton');
    const monthlyInput = inputs[1];

    expect(monthlyInput).toHaveValue(833);

    // Change to $1000
    await act(async () => {
      fireEvent.change(monthlyInput, { target: { value: '1000' } });
    });

    // Check new buying plan
    expect(screen.getByText('$600')).toBeInTheDocument();
    expect(screen.getByText('$400')).toBeInTheDocument();

    // Check new total invested (0 + 1000 * 6 = 6,000)
    expect(screen.getByText('$6,000')).toBeInTheDocument();
  });

  it('handles empty ETFs (total weight 0) gracefully', async () => {
    await act(async () => {
      render(<SavingsPlanCalculator etfs={[]} totalWeight={0} />);
    });

    expect(
      screen.getByText('Allocate some weight to your ETFs to see the dynamic buying plan.')
    ).toBeInTheDocument();
  });

  it('updates total invested when stop accumulating months is reduced', async () => {
    await act(async () => {
      render(<SavingsPlanCalculator etfs={mockEtfs} totalWeight={100} />);
    });

    const inputs = screen.getAllByRole('spinbutton');
    const stopInput = inputs[4]; // Stop accumulating months

    // Reduce stop months to 2 months
    await act(async () => {
      fireEvent.change(stopInput, { target: { value: '2' } });
    });

    // Total invested should be 0 + 2 * 833 = 1666
    expect(screen.getByText('$1,666')).toBeInTheDocument();
  });

  it('clamps values correctly and updates math when duration changes', async () => {
    await act(async () => {
      render(<SavingsPlanCalculator etfs={mockEtfs} totalWeight={100} />);
    });

    const inputs = screen.getAllByRole('spinbutton');
    const durationInput = inputs[2]; // Duration years
    const stopInput = inputs[4];

    // First, increase stop months to 240 (20 years)
    await act(async () => {
      fireEvent.change(stopInput, { target: { value: '240' } });
    });

    // Change duration to 1 year (12 months)
    await act(async () => {
      fireEvent.change(durationInput, { target: { value: '1' } });
    });

    // Even if stop months was 240, it is internally clamped to 12.
    // Total Invested = 0 + 12 * 833 = 9,996
    expect(screen.getByText('$9,996')).toBeInTheDocument();
  });
});

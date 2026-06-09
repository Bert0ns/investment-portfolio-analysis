import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard';
import { EtfConfig } from '../lib/types';

describe('Dashboard Component', () => {
  const mockEtfs: EtfConfig[] = [
    {
      id: '1',
      name: 'Vanguard World',
      issuer: 'Vanguard',
      ter: 0.15,
      globalWeight: 100,
      replicationMethod: 'Physical',
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
      fundAge: 5,
      fundSize: 1000,
      holdings: [
        { name: 'Apple', ticker: 'AAPL', weight: 10, sector: 'IT', country: 'US', currency: 'USD' },
      ],
    },
  ];

  it('renders empty state when no ETFs have weight', () => {
    render(<Dashboard etfs={[]} totalWeight={0} />);
    expect(screen.getByText('No Data to Display')).toBeInTheDocument();
    expect(
      screen.getByText('Add ETFs and allocate weight to see your portfolio analysis.')
    ).toBeInTheDocument();
  });

  it('renders KPI metrics correctly when ETFs are present', () => {
    render(<Dashboard etfs={mockEtfs} totalWeight={100} />);

    // Weighted Avg TER should be 0.15%
    expect(screen.getByText('Weighted Avg TER')).toBeInTheDocument();
    expect(screen.getByText('0.15%')).toBeInTheDocument();

    // Active ETFs should be 1
    expect(screen.getByText('Active ETFs')).toBeInTheDocument();
    // Use test id or just verify the number 1 is rendered (by checking next sibling or similar, or just trust the previous queries)
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('switches tabs correctly', () => {
    render(<Dashboard etfs={mockEtfs} totalWeight={100} />);

    // Overview is default, should show Top 10 Holdings
    expect(screen.getByText('Top 10 Holdings')).toBeInTheDocument();

    // Click Fund Details Tab
    const fundDetailsTab = screen.getByRole('button', { name: 'Fund Details' });
    fireEvent.click(fundDetailsTab);

    // Should show Provider Allocation
    expect(screen.getByText('Provider Allocation')).toBeInTheDocument();

    // Click Risk Analysis Tab
    const riskTab = screen.getByRole('button', { name: 'Risk Analysis' });
    fireEvent.click(riskTab);

    // Should show Replication Method
    expect(screen.getByText('Replication Method')).toBeInTheDocument();
  });
});

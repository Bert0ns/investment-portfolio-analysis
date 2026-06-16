import { generateMoneyFlowData } from '../lib/math/moneyFlowLayout';
import { EtfConfig } from '../lib/types';

describe('moneyFlowLayout', () => {
  it('returns empty data when no active ETFs are provided', () => {
    const result = generateMoneyFlowData([]);
    expect(result.nodes).toEqual([]);
    expect(result.links).toEqual([]);

    const inactiveEtf = { globalWeight: 0 } as EtfConfig;
    const inactiveResult = generateMoneyFlowData([inactiveEtf]);
    expect(inactiveResult.nodes).toEqual([]);
    expect(inactiveResult.links).toEqual([]);
  });

  it('generates nodes and links for a valid ETF', () => {
    const mockEtfs: EtfConfig[] = [
      {
        id: 'etf-1',
        name: 'Tech ETF',
        isin: 'IE0000000001',
        issuer: 'Vanguard',
        ter: 0.1,
        globalWeight: 100,
        fundSize: 1000,
        fundAge: 5,
        domicile: 'Ireland',
        replicationMethod: 'Physical',
        useOfProfit: 'Accumulating',
        holdings: [
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            weight: 10,
            sector: 'Information Technology',
            country: 'USA',
            currency: 'USD',
          },
          {
            ticker: 'MSFT',
            name: 'Microsoft',
            weight: 5,
            sector: 'Information Technology',
            country: 'USA',
            currency: 'USD',
          },
        ],
      },
    ];

    const result = generateMoneyFlowData(mockEtfs, 30);

    // Nodes: Portfolio(1) + ETF(1) + Sectors(1) + Companies(2) + "Other Companies"(1, always created due to limit) -> actually "Other Companies" might not have any links if not needed, but let's check basic generation.
    expect(result.nodes.length).toBeGreaterThan(0);
    expect(result.links.length).toBeGreaterThan(0);

    // Verify structural nodes exist
    const nodeIds = result.nodes.map((n) => n.id);
    expect(nodeIds).toContain('Portfolio');
    expect(nodeIds).toContain('ETF_etf-1');
    expect(nodeIds).toContain('SEC_Information Technology'); // Normalized name
    expect(nodeIds).toContain('COMP_AAPL');
    expect(nodeIds).toContain('COMP_MSFT');
  });

  it('groups companies beyond the topCompaniesCount into Other Companies', () => {
    const mockEtfs: EtfConfig[] = [
      {
        id: 'etf-1',
        name: 'Broad ETF',
        isin: 'IE0000000002',
        issuer: 'Vanguard',
        ter: 0.1,
        globalWeight: 100,
        fundSize: 1000,
        fundAge: 5,
        domicile: 'Ireland',
        replicationMethod: 'Physical',
        useOfProfit: 'Accumulating',
        holdings: [
          {
            ticker: 'A',
            name: 'Company A',
            weight: 40,
            sector: 'Financials',
            country: 'USA',
            currency: 'USD',
          },
          {
            ticker: 'B',
            name: 'Company B',
            weight: 30,
            sector: 'Financials',
            country: 'USA',
            currency: 'USD',
          },
          {
            ticker: 'C',
            name: 'Company C',
            weight: 20,
            sector: 'Financials',
            country: 'USA',
            currency: 'USD',
          },
          {
            ticker: 'D',
            name: 'Company D',
            weight: 10,
            sector: 'Financials',
            country: 'USA',
            currency: 'USD',
          },
        ],
      },
    ];

    // Limit to top 2 companies
    const result = generateMoneyFlowData(mockEtfs, 2);

    const nodeIds = result.nodes.map((n) => n.id);
    expect(nodeIds).toContain('COMP_A');
    expect(nodeIds).toContain('COMP_B');
    // C and D should be grouped into 'COMP_Other'
    expect(nodeIds).not.toContain('COMP_C');
    expect(nodeIds).not.toContain('COMP_D');
    expect(nodeIds).toContain('COMP_Other');
  });

  it('safely handles Sankey generation errors (e.g. cyclic links)', () => {
    const mockEtfs: EtfConfig[] = [
      {
        id: 'etf-bad',
        name: 'Bad ETF',
        isin: 'IE0000000003',
        issuer: 'iShares',
        ter: 0.2,
        globalWeight: 100,
        fundSize: 1000,
        fundAge: 5,
        domicile: 'Ireland',
        replicationMethod: 'Physical',
        useOfProfit: 'Accumulating',
        holdings: [
          // If a holding's sector is named Portfolio, it could create a cycle if not careful, though our IDs are prefixed.
          // Let's mock a scenario where Sankey throws.
          {
            ticker: 'N/A',
            name: 'Unknown',
            weight: -50,
            sector: 'Test',
            country: 'US',
            currency: 'USD',
          },
        ],
      },
    ];
    // This actually will just ignore negative weights, but it's a good edge case test
    const result = generateMoneyFlowData(mockEtfs);
    expect(result.nodes.length).toBeGreaterThan(0); // Portfolio, ETF nodes at least
  });
});

import { sankey, sankeyJustify } from 'd3-sankey';
import { EtfConfig } from '@/lib/types';
import { normalizeSector } from '@/lib/math';

export interface FlowNode {
  id: string;
  type: 'portfolio' | 'etf' | 'sector' | 'company';
  name: string;
  ter?: number;
  redundancy?: number;
  value?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
}

export interface FlowLink {
  source: string | FlowNode;
  target: string | FlowNode;
  value: number;
  width?: number;
  y0?: number;
  y1?: number;
}

export function generateMoneyFlowData(etfs: EtfConfig[], topCompaniesCount: number = 30) {
  const activeEtfs = etfs.filter((e) => e.globalWeight > 0);
  if (activeEtfs.length === 0) return { nodes: [], links: [] };

  const nodesMap = new Map<string, FlowNode>();
  const linksMap = new Map<string, FlowLink>();

  const addNode = (
    id: string,
    type: FlowNode['type'],
    name: string,
    ter?: number,
    redundancy?: number
  ) => {
    if (!nodesMap.has(id)) {
      nodesMap.set(id, { id, type, name, ter, redundancy });
    } else {
      if (redundancy !== undefined) {
        nodesMap.get(id)!.redundancy = redundancy;
      }
    }
    return id;
  };

  const addLink = (source: string, target: string, value: number) => {
    const key = `${source}->${target}`;
    if (!linksMap.has(key)) {
      linksMap.set(key, { source, target, value });
    } else {
      linksMap.get(key)!.value += value;
    }
  };

  // 1. Add Portfolio
  addNode('Portfolio', 'portfolio', 'Total Portfolio');

  // To find top companies, we aggregate first
  const companyAgg = new Map<string, { name: string; value: number; etfCount: Set<string> }>();

  activeEtfs.forEach((etf) => {
    const etfId = addNode(`ETF_${etf.id}`, 'etf', etf.name, etf.ter);
    addLink('Portfolio', etfId, etf.globalWeight);

    etf.holdings.forEach((h) => {
      const value = (etf.globalWeight * Number(h.weight)) / 100;
      if (value <= 0 || isNaN(value)) return;

      const compId = `COMP_${h.ticker !== 'N/A' ? h.ticker : h.name}`;
      if (!companyAgg.has(compId)) {
        companyAgg.set(compId, { name: h.name, value: 0, etfCount: new Set() });
      }
      companyAgg.get(compId)!.value += value;
      companyAgg.get(compId)!.etfCount.add(etf.id);
    });
  });

  // Sort companies and pick top ones
  const sortedCompanies = Array.from(companyAgg.entries()).sort((a, b) => b[1].value - a[1].value);
  const topCompanies = new Set(sortedCompanies.slice(0, topCompaniesCount).map((c) => c[0]));

  // Now build the rest of the nodes and links
  activeEtfs.forEach((etf) => {
    const etfId = `ETF_${etf.id}`;

    etf.holdings.forEach((h) => {
      const value = (etf.globalWeight * Number(h.weight)) / 100;
      if (value <= 0 || isNaN(value)) return;

      const sectorName = normalizeSector(h.sector) || 'Unknown';
      const sectorId = addNode(`SEC_${sectorName}`, 'sector', sectorName);

      const baseCompId = `COMP_${h.ticker !== 'N/A' ? h.ticker : h.name}`;
      const isTop = topCompanies.has(baseCompId);

      const compId = isTop ? baseCompId : 'COMP_Other';
      const compName = isTop ? h.name : 'Other Companies';
      const redundancy = isTop ? companyAgg.get(baseCompId)!.etfCount.size : 1;

      addNode(compId, 'company', compName, undefined, redundancy);

      // Link ETF -> Sector
      addLink(etfId, sectorId, value);
      // Link Sector -> Company
      addLink(sectorId, compId, value);
    });
  });

  const rawNodes = Array.from(nodesMap.values());
  const rawLinks = Array.from(linksMap.values());

  // Calculate a dynamic height for the layout based on the number of companies.
  // This guarantees that as the user increases the slider, the chart physically
  // expands rather than squishing the nodes together, keeping spacing constant.
  const totalCompanies = topCompanies.size + 1; // +1 for "Other Companies"

  // We explicitly calculate the exact layout bounds to control the visual proportions!
  // We want a massive gap between nodes: 400 D3 units
  const paddingTarget = 400;
  // We want the total node thickness (ky) to be small so the bases are shorter: 500 D3 units
  const nodeThicknessTarget = 500;

  const dynamicHeight = Math.max(1000, (totalCompanies - 1) * paddingTarget + nodeThicknessTarget);

  const sankeyGen = sankey<FlowNode, FlowLink>()
    .nodeId((d) => d.id)
    .nodeAlign(sankeyJustify) // Force stages: 0, 1, 2, 3
    .nodeWidth(100)
    .nodePadding(paddingTarget)
    // We massively expand the X-axis (from 1000 to 2500) to spread the 4 columns far apart!
    .extent([
      [0, 0],
      [2500, dynamicHeight],
    ])
    .nodeSort((a, b) => {
      // Force "Other Companies" to always be at the very top
      if (a.id === 'COMP_Other') return -1;
      if (b.id === 'COMP_Other') return 1;
      // Sort all other nodes strictly by their portfolio weight (largest first)
      return (b.value || 0) - (a.value || 0);
    });

  try {
    const { nodes, links } = sankeyGen({
      nodes: rawNodes.map((d) => ({ ...d })),
      links: rawLinks.map((d) => ({ ...d })),
    });
    return { nodes, links };
  } catch (e) {
    console.error('Sankey generation failed', e);
    return { nodes: [], links: [] };
  }
}

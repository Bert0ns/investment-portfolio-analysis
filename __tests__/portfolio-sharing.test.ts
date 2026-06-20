import {
  exportPortfolioToLens,
  importPortfolioFromLens,
  exportPortfolioToSmartPNG,
  importPortfolioFromSmartPNG,
} from '../lib/utils/portfolio-sharing';
import { EtfConfig } from '../lib/types';

// A minimal 1x1 transparent PNG data URL for testing image processing
const MINIMAL_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

// Polyfill arrayBuffer for jsdom
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function () {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(this);
    });
  };
}
if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(this);
    });
  };
}

describe('Portfolio Sharing Logic', () => {
  const mockPortfolio: EtfConfig[] = [
    {
      id: 'etf1',
      name: 'VWCE',
      globalWeight: 60,
      ter: 0.22,
      issuer: 'Vanguard',
      holdings: [],
      replicationMethod: 'Physical',
      fundSize: 1000,
      fundAge: 5,
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
    },
    {
      id: 'etf2',
      name: 'AGGH',
      globalWeight: 40,
      ter: 0.1,
      issuer: 'iShares',
      holdings: [],
      replicationMethod: 'Physical',
      fundSize: 2000,
      fundAge: 10,
      useOfProfit: 'Accumulating',
      domicile: 'Ireland',
    },
  ];

  describe('.lens Cartridge Methods', () => {
    it('should export and import a portfolio correctly using .lens files', async () => {
      // 1. Export the portfolio to a Blob
      const blob = exportPortfolioToLens(mockPortfolio);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/octet-stream');

      // 2. Convert Blob to File (simulating user download/upload)
      const file = new File([blob], 'portfolio.lens', { type: 'application/octet-stream' });

      // 3. Import the file back
      const importedPortfolio = await importPortfolioFromLens(file);

      // 4. Assert correctness
      expect(importedPortfolio).toEqual(mockPortfolio);
      expect(importedPortfolio.length).toBe(2);
      expect(importedPortfolio[0].name).toBe('VWCE');
    });

    it('should throw an error for corrupted .lens files', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Create a corrupted file
      const corruptedFile = new File([new Uint8Array([1, 2, 3, 4])], 'corrupted.lens');

      // Attempting to import should reject
      await expect(importPortfolioFromLens(corruptedFile)).rejects.toThrow(
        'Invalid or corrupted portfolio data.'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Smart PNG Methods', () => {
    it('should inject portfolio into PNG and extract it successfully', async () => {
      // 1. Export portfolio into the minimal PNG
      const blob = exportPortfolioToSmartPNG(mockPortfolio, MINIMAL_PNG);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');

      // 2. Convert to File
      const file = new File([blob], 'smart-portfolio.png', { type: 'image/png' });

      // 3. Import from PNG
      const importedPortfolio = await importPortfolioFromSmartPNG(file);

      // 4. Assert correctness
      expect(importedPortfolio).toEqual(mockPortfolio);
      expect(importedPortfolio.length).toBe(2);
      expect(importedPortfolio[1].name).toBe('AGGH');
    });

    it('should throw an error if PNG does not contain portfolio data', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Base64 decode minimal PNG without injecting anything
      const base64 = MINIMAL_PNG.split(',')[1];
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert to file
      const file = new File([bytes], 'normal-image.png', { type: 'image/png' });

      // Should fail to find payload chunk
      await expect(importPortfolioFromSmartPNG(file)).rejects.toThrow(
        'Failed to extract portfolio from image. The image may have been compressed or stripped by a social network.'
      );

      consoleSpy.mockRestore();
    });
  });
});

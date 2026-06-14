import { cn, generateId } from '@/lib/utils';

describe('Utils', () => {
  describe('cn', () => {
    it('merges tailwind classes correctly', () => {
      expect(cn('p-2', 'p-4')).toBe('p-4');
      expect(cn('p-2', undefined, null, false, 'text-red-500')).toBe('p-2 text-red-500');
    });
  });

  describe('generateId', () => {
    it('generates a string id', () => {
      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('generates unique ids', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
    });

    it('uses fallback when crypto.randomUUID is not available', () => {
      // Mock crypto.randomUUID
      const originalCrypto = global.crypto;
      Object.defineProperty(global, 'crypto', {
        value: {
          ...originalCrypto,
          randomUUID: undefined,
        },
        writable: true,
      });

      const id = generateId();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(10);

      // Restore crypto
      global.crypto = originalCrypto;
    });
  });
});

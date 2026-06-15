import { setItem, getItem, removeItem } from '@/lib/indexeddb';

describe('indexeddb', () => {
  describe('Client-side (window is defined)', () => {
    let mockStore: { put: jest.Mock; get: jest.Mock; delete: jest.Mock };
    let mockTransaction: { objectStore: jest.Mock };
    let mockDb: {
      transaction: jest.Mock;
      objectStoreNames: { contains: jest.Mock };
      createObjectStore: jest.Mock;
    };
    let mockOpenRequest: {
      onsuccess: (() => void) | null;
      onerror: (() => void) | null;
      onupgradeneeded: ((event: unknown) => void) | null;
      result?: unknown;
      error?: Error;
    };

    const createSuccessReq = () => {
      const req: { onsuccess: (() => void) | null; onerror: (() => void) | null } = {
        onsuccess: null,
        onerror: null,
      };
      setTimeout(() => req.onsuccess && req.onsuccess(), 0);
      return req;
    };

    const createErrorReq = (errorMsg: string) => {
      const req: { onsuccess: (() => void) | null; onerror: (() => void) | null; error?: Error } = {
        onsuccess: null,
        onerror: null,
        error: new Error(errorMsg),
      };
      setTimeout(() => req.onerror && req.onerror(), 0);
      return req;
    };

    beforeEach(() => {
      mockStore = {
        put: jest.fn().mockImplementation(createSuccessReq),
        get: jest.fn().mockImplementation((key) => {
          const req: {
            onsuccess: (() => void) | null;
            onerror: (() => void) | null;
            result?: unknown;
          } = { onsuccess: null, onerror: null, result: key === 'exists' ? 'value' : undefined };
          setTimeout(() => req.onsuccess && req.onsuccess(), 0);
          return req;
        }),
        delete: jest.fn().mockImplementation(createSuccessReq),
      };

      mockTransaction = {
        objectStore: jest.fn().mockReturnValue(mockStore),
      };

      mockDb = {
        transaction: jest.fn().mockReturnValue(mockTransaction),
        objectStoreNames: {
          contains: jest.fn().mockReturnValue(true),
        },
        createObjectStore: jest.fn(),
      };

      mockOpenRequest = {
        onsuccess: null,
        onerror: null,
        onupgradeneeded: null,
        result: mockDb,
      };

      Object.defineProperty(window, 'indexedDB', {
        value: {
          open: jest.fn().mockReturnValue(mockOpenRequest),
        },
        writable: true,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sets an item successfully', async () => {
      const promise = setItem('testKey', 'testValue');
      mockOpenRequest.onsuccess?.();
      await promise;

      expect(window.indexedDB.open).toHaveBeenCalledWith('EtfPortfolioDB', 1);
      expect(mockDb.transaction).toHaveBeenCalledWith('etf_store', 'readwrite');
      expect(mockStore.put).toHaveBeenCalledWith('testValue', 'testKey');
    });

    it('handles setItem error', async () => {
      mockStore.put.mockImplementation(() => createErrorReq('Put failed'));

      const promise = setItem('testKey', 'testValue');
      mockOpenRequest.onsuccess?.();

      await expect(promise).rejects.toThrow('Put failed');
    });

    it('gets an existing item successfully', async () => {
      const promise = getItem('exists');
      mockOpenRequest.onsuccess?.();
      const result = await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith('etf_store', 'readonly');
      expect(mockStore.get).toHaveBeenCalledWith('exists');
      expect(result).toBe('value');
    });

    it('gets a non-existing item as null', async () => {
      const promise = getItem('missing');
      mockOpenRequest.onsuccess?.();
      const result = await promise;

      expect(result).toBeNull();
    });

    it('gets an item and handles error', async () => {
      mockStore.get.mockImplementation(() => createErrorReq('Get failed'));

      const promise = getItem('exists');
      mockOpenRequest.onsuccess?.();

      await expect(promise).rejects.toThrow('Get failed');
    });

    it('removes an item successfully', async () => {
      const promise = removeItem('testKey');
      mockOpenRequest.onsuccess?.();
      await promise;

      expect(mockDb.transaction).toHaveBeenCalledWith('etf_store', 'readwrite');
      expect(mockStore.delete).toHaveBeenCalledWith('testKey');
    });

    it('removes an item and handles error', async () => {
      mockStore.delete.mockImplementation(() => createErrorReq('Delete failed'));

      const promise = removeItem('testKey');
      mockOpenRequest.onsuccess?.();

      await expect(promise).rejects.toThrow('Delete failed');
    });

    it('handles open database error', async () => {
      mockOpenRequest.error = new Error('DB Open Error');
      const promise = setItem('testKey', 'testValue');
      mockOpenRequest.onerror?.();

      await expect(promise).rejects.toThrow('DB Open Error');
    });

    it('handles database upgrade (onupgradeneeded)', async () => {
      mockDb.objectStoreNames.contains.mockReturnValue(false);

      const promise = setItem('testKey', 'testValue');

      // Simulate upgradeneeded event
      mockOpenRequest.onupgradeneeded?.({
        target: { result: mockDb },
      } as unknown as IDBVersionChangeEvent);
      expect(mockDb.createObjectStore).toHaveBeenCalledWith('etf_store');

      // Complete open request
      mockOpenRequest.onsuccess?.();
      await promise;
    });
  });
});

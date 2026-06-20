import { executeRequest } from './core';

export async function setItem(key: string, value: unknown): Promise<void> {
  if (typeof indexedDB === 'undefined') return;
  await executeRequest('readwrite', (store) => store.put(value, key));
}

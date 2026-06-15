import { executeRequest } from './core';

export async function removeItem(key: string): Promise<void> {
  if (typeof window === 'undefined') return;
  await executeRequest('readwrite', (store) => store.delete(key));
}

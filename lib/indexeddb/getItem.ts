import { executeRequest } from './core';

export async function getItem<T>(key: string): Promise<T | null> {
  if (typeof window === 'undefined') return null;
  const result = await executeRequest<T>('readonly', (store) => store.get(key));
  return result !== undefined ? result : null;
}

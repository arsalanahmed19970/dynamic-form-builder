import { useEffect, useState } from 'react';

/**
 * Returns true only after the component has mounted on the client.
 * Use this to prevent hydration mismatches when reading from Zustand persist (localStorage).
 */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

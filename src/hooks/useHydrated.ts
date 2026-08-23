import { useEffect, useState } from "react";
import { usePlanStore } from "@/store/planStore";

/**
 * Rehydrates persisted plan state after mount so SSR markup and the first
 * client render always match.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    void usePlanStore.persist.rehydrate();
    setHydrated(true);
  }, []);
  return hydrated;
}

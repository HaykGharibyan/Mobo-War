import { useCallback, useEffect, useState } from 'react';
import {
  markStarterOfferClosed,
  markStarterOfferPurchased,
  markStarterOfferShown,
  readStarterOffer,
  type StarterOfferSnapshot,
} from '../services/StarterOfferService';

export function useStarterOffer(): StarterOfferSnapshot & {
  refresh: () => void;
  markShown: () => void;
  markClosed: () => void;
  markPurchased: () => void;
} {
  const [offer, setOffer] = useState<StarterOfferSnapshot>(() => readStarterOffer());
  const refresh = useCallback(() => setOffer(readStarterOffer()), []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 1000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const markShown = useCallback(() => setOffer(markStarterOfferShown()), []);
  const markClosed = useCallback(() => setOffer(markStarterOfferClosed()), []);
  const markPurchased = useCallback(() => setOffer(markStarterOfferPurchased()), []);

  return { ...offer, refresh, markShown, markClosed, markPurchased };
}

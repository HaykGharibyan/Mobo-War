export const STARTER_OFFER_DURATION_MS = 24 * 60 * 60 * 1000;

export const STARTER_OFFER_KEYS = {
  firstSeenAt: 'starterPackFirstSeenAt',
  expiresAt: 'starterPackExpiresAt',
  purchased: 'starterPackPurchased',
  shownOnce: 'starterPackShownOnce',
  closed: 'starterPackClosed',
} as const;

export type StarterOfferSnapshot = {
  firstSeenAt: number;
  expiresAt: number;
  remainingMs: number;
  isActive: boolean;
  purchased: boolean;
  shownOnce: boolean;
  closed: boolean;
};

function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // The offer still works for the current session if storage is unavailable.
  }
}

function storageBoolean(key: string): boolean {
  return storageGet(key) === 'true';
}

export function ensureStarterOfferStarted(now = Date.now()): { firstSeenAt: number; expiresAt: number } {
  const savedFirstSeen = Number(storageGet(STARTER_OFFER_KEYS.firstSeenAt));
  const savedExpires = Number(storageGet(STARTER_OFFER_KEYS.expiresAt));
  const firstSeenAt = Number.isFinite(savedFirstSeen) && savedFirstSeen > 0 ? savedFirstSeen : now;
  const expiresAt = Number.isFinite(savedExpires) && savedExpires > firstSeenAt
    ? savedExpires
    : firstSeenAt + STARTER_OFFER_DURATION_MS;

  if (savedFirstSeen !== firstSeenAt) storageSet(STARTER_OFFER_KEYS.firstSeenAt, String(firstSeenAt));
  if (savedExpires !== expiresAt) storageSet(STARTER_OFFER_KEYS.expiresAt, String(expiresAt));
  return { firstSeenAt, expiresAt };
}

export function readStarterOffer(now = Date.now()): StarterOfferSnapshot {
  const { firstSeenAt, expiresAt } = ensureStarterOfferStarted(now);
  const remainingMs = Math.max(0, expiresAt - now);
  const purchased = storageBoolean(STARTER_OFFER_KEYS.purchased);

  return {
    firstSeenAt,
    expiresAt,
    remainingMs,
    purchased,
    isActive: !purchased && remainingMs > 0,
    shownOnce: storageBoolean(STARTER_OFFER_KEYS.shownOnce),
    closed: storageBoolean(STARTER_OFFER_KEYS.closed),
  };
}

export function markStarterOfferShown(): StarterOfferSnapshot {
  storageSet(STARTER_OFFER_KEYS.shownOnce, 'true');
  return readStarterOffer();
}

export function markStarterOfferClosed(): StarterOfferSnapshot {
  storageSet(STARTER_OFFER_KEYS.closed, 'true');
  return readStarterOffer();
}

export function markStarterOfferPurchased(): StarterOfferSnapshot {
  storageSet(STARTER_OFFER_KEYS.purchased, 'true');
  return readStarterOffer();
}

// Start the window as soon as the game bundle is opened, rather than when Shop is opened.
ensureStarterOfferStarted();

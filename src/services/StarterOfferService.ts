import { syncTrustedClock, trustedNowMs } from './TrustedClock';

export const STARTER_OFFER_DURATION_MS = 24 * 60 * 60 * 1000;

export const STARTER_OFFER_KEYS = {
  firstSeenAt: 'starterPackFirstSeenAt',
  expiresAt: 'starterPackExpiresAt',
  purchased: 'starterPackPurchased',
  shownOnce: 'starterPackShownOnce',
  closed: 'starterPackClosed',
  clockVersion: 'starterPackClockVersion',
} as const;

const SERVER_CLOCK_VERSION = 'server-v1';

export type StarterOfferSnapshot = {
  firstSeenAt: number;
  expiresAt: number;
  remainingMs: number;
  /** The Royal Starter Pack is available in the current 24-hour cycle. */
  isActive: boolean;
  /** True while the current 24-hour countdown is running. */
  isLimited: boolean;
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

export function ensureStarterOfferStarted(now = trustedNowMs()): { firstSeenAt: number; expiresAt: number } {
  const savedFirstSeen = Number(storageGet(STARTER_OFFER_KEYS.firstSeenAt));
  const savedExpires = Number(storageGet(STARTER_OFFER_KEYS.expiresAt));
  let firstSeenAt = Number.isFinite(savedFirstSeen) && savedFirstSeen > 0 ? savedFirstSeen : now;
  let expiresAt = Number.isFinite(savedExpires) && savedExpires > firstSeenAt
    ? savedExpires
    : firstSeenAt + STARTER_OFFER_DURATION_MS;
  let rolledToNextCycle = false;

  // The promo is always available. When one 24-hour window ends, roll it
  // forward to the next window instead of converting it to a full-price set.
  if (now >= expiresAt) {
    const elapsedWindows = Math.floor((now - expiresAt) / STARTER_OFFER_DURATION_MS) + 1;
    firstSeenAt = expiresAt + (elapsedWindows - 1) * STARTER_OFFER_DURATION_MS;
    expiresAt = firstSeenAt + STARTER_OFFER_DURATION_MS;
    rolledToNextCycle = true;
  }

  if (savedFirstSeen !== firstSeenAt) storageSet(STARTER_OFFER_KEYS.firstSeenAt, String(firstSeenAt));
  if (savedExpires !== expiresAt) storageSet(STARTER_OFFER_KEYS.expiresAt, String(expiresAt));
  if (rolledToNextCycle) {
    storageSet(STARTER_OFFER_KEYS.purchased, 'false');
    storageSet(STARTER_OFFER_KEYS.shownOnce, 'false');
    storageSet(STARTER_OFFER_KEYS.closed, 'false');
  }
  return { firstSeenAt, expiresAt };
}

/** Align legacy local timestamps to trusted server time once. */
export async function syncStarterOfferClock(): Promise<void> {
  const serverNow = await syncTrustedClock();
  if (serverNow === null) return;

  if (storageGet(STARTER_OFFER_KEYS.clockVersion) !== SERVER_CLOCK_VERSION) {
    const savedFirstSeen = Number(storageGet(STARTER_OFFER_KEYS.firstSeenAt));
    const savedExpires = Number(storageGet(STARTER_OFFER_KEYS.expiresAt));
    const offset = serverNow - Date.now();
    const firstSeenAt = Number.isFinite(savedFirstSeen) && savedFirstSeen > 0
      ? savedFirstSeen + offset
      : serverNow;
    const expiresAt = Number.isFinite(savedExpires) && savedExpires > firstSeenAt
      ? savedExpires + offset
      : firstSeenAt + STARTER_OFFER_DURATION_MS;
    storageSet(STARTER_OFFER_KEYS.firstSeenAt, String(firstSeenAt));
    storageSet(STARTER_OFFER_KEYS.expiresAt, String(expiresAt));
    storageSet(STARTER_OFFER_KEYS.clockVersion, SERVER_CLOCK_VERSION);
  }

  ensureStarterOfferStarted(serverNow);
}

export function readStarterOffer(now = trustedNowMs()): StarterOfferSnapshot {
  const { firstSeenAt, expiresAt } = ensureStarterOfferStarted(now);
  const remainingMs = Math.max(0, expiresAt - now);
  const purchased = storageBoolean(STARTER_OFFER_KEYS.purchased);
  const isLimited = !purchased && remainingMs > 0;

  return {
    firstSeenAt,
    expiresAt,
    remainingMs,
    purchased,
    isActive: !purchased,
    isLimited,
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

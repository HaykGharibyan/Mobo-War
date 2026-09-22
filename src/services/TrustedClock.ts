const TRUSTED_TIME_KEY = 'mobo-trusted-server-time-v1';
const REQUEST_TIMEOUT_MS = 2500;

let sessionAnchor: { serverMs: number; performanceMs: number } | null = null;
let syncPromise: Promise<number | null> | null = null;

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
    // The in-memory anchor still protects the current session.
  }
}

function performanceMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function validEpoch(value: number): boolean {
  return Number.isFinite(value) && value > 1_000_000_000_000;
}

function setSessionAnchor(serverMs: number): void {
  sessionAnchor = { serverMs, performanceMs: performanceMs() };
  storageSet(TRUSTED_TIME_KEY, String(serverMs));
}

function parseDateHeader(response: Response): number | null {
  const value = response.headers.get('date');
  if (!value) return null;
  const parsed = Date.parse(value);
  return validEpoch(parsed) ? parsed : null;
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, cache: 'no-store', signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

async function readSameOriginServerTime(): Promise<number | null> {
  if (typeof window === 'undefined') return null;
  try {
    const url = new URL('/index.html', window.location.origin);
    url.searchParams.set('mobo_time', String(Math.floor(Math.random() * 1_000_000)));
    const response = await fetchWithTimeout(url.toString(), { method: 'HEAD', credentials: 'omit' });
    return parseDateHeader(response);
  } catch {
    return null;
  }
}

async function readWorldTimeApi(): Promise<number | null> {
  try {
    const response = await fetchWithTimeout('https://worldtimeapi.org/api/timezone/Etc/UTC', { credentials: 'omit' });
    if (!response.ok) return null;
    const payload = await response.json() as { unixtime?: number };
    const parsed = Number(payload.unixtime) * 1000;
    return validEpoch(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function readTimeApiIo(): Promise<number | null> {
  try {
    const response = await fetchWithTimeout('https://timeapi.io/api/Time/current/zone?timeZone=UTC', { credentials: 'omit' });
    if (!response.ok) return null;
    const payload = await response.json() as { dateTime?: string };
    const parsed = Date.parse(String(payload.dateTime || ''));
    return validEpoch(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Returns a clock that cannot move backwards or forwards when the device
 * system time changes. During a session it advances from performance.now().
 * Between sessions it remains at the last trusted server value until sync.
 */
export function trustedNowMs(): number {
  if (sessionAnchor) {
    return sessionAnchor.serverMs + Math.max(0, performanceMs() - sessionAnchor.performanceMs);
  }
  const saved = Number(storageGet(TRUSTED_TIME_KEY));
  return validEpoch(saved) ? saved : Date.now();
}

export function hasTrustedTime(): boolean {
  return sessionAnchor !== null || validEpoch(Number(storageGet(TRUSTED_TIME_KEY)));
}

export async function syncTrustedClock(): Promise<number | null> {
  if (syncPromise) return syncPromise;
  syncPromise = (async () => {
    const sameOrigin = await readSameOriginServerTime();
    const serverMs = sameOrigin ?? await readWorldTimeApi() ?? await readTimeApiIo();
    if (serverMs !== null) setSessionAnchor(serverMs);
    return serverMs;
  })().finally(() => {
    syncPromise = null;
  });
  return syncPromise;
}

import { syncTrustedClock, trustedNowMs } from './TrustedClock';

/** Central clock abstraction shared by promo, daily and weekly timers. */
export const TimeService={now:()=>new Date(trustedNowMs()),dayKey:()=>new Date(trustedNowMs()).toISOString().slice(0,10)};

// Start syncing as early as possible; the promise is shared with the promo hook.
void syncTrustedClock();

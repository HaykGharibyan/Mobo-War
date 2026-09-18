/** Central clock abstraction; replace now() with server time when backend is connected. */
export const TimeService={now:()=>new Date(),dayKey:()=>new Date().toISOString().slice(0,10)};

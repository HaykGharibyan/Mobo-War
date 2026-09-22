type AnalyticsParams = Record<string, unknown>;

type LevelInput = Record<string, unknown>;

/**
 * Local no-op event sink.
 *
 * The game intentionally has no remote analytics or crash-reporting SDK.
 * Keeping this small compatibility surface lets gameplay code stay focused on
 * the game while making every former telemetry call side-effect free.
 */
class LocalEventSink {
  track(_name: string, _params?: AnalyticsParams): void {}
  trackScreen(_screen: string): void {}
  trackLobbyOpen(): void {}
  trackWorldMapOpen(): void {}
  trackShopOpen(): void {}
  trackCrystalChallengeOpen(): void {}
  trackWorldSelected(_world: string, _selectedLevel: number): void {}
  trackPlayClicked(_level: number, _world: string): void {}
  trackLevelStart(_input: LevelInput): void {}
  trackLevelComplete(_input: LevelInput): void {}
  trackLevelFailed(_input: LevelInput): void {}
  trackUpgrade(_kind: 'unit' | 'weapon', _input: LevelInput): void {}
  trackSkinSelected(_input: LevelInput): void {}
  trackBoostUsed(_input: LevelInput): void {}
  trackDailyReward(_input: LevelInput): void {}
  trackMissionComplete(_input: LevelInput): void {}
  trackPromoView(_source: string, _remainingSeconds: number): void {}
  trackPromoClick(_source: string, _remainingSeconds: number): void {}
  trackPromoClose(_source: string, _remainingSeconds: number): void {}
  trackPromoPurchaseStarted(_source: string, _remainingSeconds: number): void {}
  trackPromoPurchaseSuccess(_source: string, _remainingSeconds: number, _transactionId: string): void {}
  trackPromoPurchaseFailed(_source: string, _remainingSeconds: number, _reason: string): void {}
  trackPurchaseStarted(_input: LevelInput): void {}
  updatePlayerProperties(_input: LevelInput): void {}
  reportError(error: unknown, _context?: AnalyticsParams): void { if (import.meta.env.DEV) console.error('[local-error]', error); }
}

export const AnalyticsService = new LocalEventSink();

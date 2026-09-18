import { AnalyticsEvents, STARTER_PACK_PARAMS } from './analyticsEvents';
import { NativeFirebase } from './nativeFirebase';
import type { AnalyticsParams, GameplayAnalyticsContext, LevelAnalyticsInput, LevelFinishAnalyticsInput, NativeFirebaseStatus } from './analyticsTypes';

const FIRST_OPEN_KEY = 'mobo-analytics-first-open-v1';
const ATTEMPTS_KEY = 'mobo-analytics-level-attempts-v1';
const MAX_EVENT_NAME_LENGTH = 40;
const MAX_PARAM_NAME_LENGTH = 40;

function isValidName(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]{0,39}$/.test(value);
}

function sanitizeParams(params: AnalyticsParams = {}): AnalyticsParams {
  return Object.fromEntries(Object.entries(params)
    .filter(([key, value]) => key.length <= MAX_PARAM_NAME_LENGTH && isValidName(key) && value !== undefined && value !== null)
    .map(([key, value]) => [key, typeof value === 'string' ? value.slice(0, 100) : value])) as AnalyticsParams;
}

function readAttempts(): Record<string, number> {
  try {
    const value = JSON.parse(sessionStorage.getItem(ATTEMPTS_KEY) || '{}');
    return value && typeof value === 'object' ? value as Record<string, number> : {};
  } catch { return {}; }
}

function nextAttempt(level: number): number {
  const attempts = readAttempts();
  const key = String(level);
  const value = Math.max(0, Number(attempts[key]) || 0) + 1;
  attempts[key] = value;
  try { sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts)); } catch { /* optional diagnostics only */ }
  return value;
}

class MoboAnalyticsService {
  private context: GameplayAnalyticsContext = {};
  private startedBattleIds = new Set<string>();
  private finishedBattleIds = new Set<string>();
  private attemptsByBattleId = new Map<string, number>();
  private lastScreen = '';
  private errorHandlersInstalled = false;
  private promoViews = new Set<string>();
  private appInfo: NativeFirebaseStatus = { available: false, appVersion: 'unknown', buildNumber: 'unknown', packageName: 'unknown', debugBuild: false };

  async initialize(): Promise<void> {
    this.appInfo = await NativeFirebase.getStatus();
    this.setCrashContext({ app_version: this.appInfo.appVersion, build_number: this.appInfo.buildNumber });
    this.trackFirstOpen();
    if (!this.errorHandlersInstalled && typeof window !== 'undefined') {
      this.errorHandlersInstalled = true;
      window.addEventListener('error', event => {
        if (event.error) this.reportError(event.error, { source: 'window_error' });
      });
      window.addEventListener('unhandledrejection', event => {
        this.reportError(event.reason, { source: 'unhandled_rejection' });
      });
    }
  }

  private emit(name: string, params: AnalyticsParams = {}, dedupeKey?: string): void {
    if (!isValidName(name) || name.length > MAX_EVENT_NAME_LENGTH) return;
    if (dedupeKey && this.startedBattleIds.has(dedupeKey)) return;
    if (dedupeKey) this.startedBattleIds.add(dedupeKey);
    const payload = sanitizeParams({ ...params, app_version: this.appInfo.appVersion });
    if (import.meta.env.DEV) console.info('[analytics]', name, payload);
    NativeFirebase.logEvent(name, payload);
  }

  private breadcrumb(message: string): void {
    if (import.meta.env.DEV) console.info('[breadcrumb]', message);
    NativeFirebase.log(message.slice(0, 240));
  }

  setContext(next: GameplayAnalyticsContext): void {
    this.context = { ...this.context, ...next };
    this.setCrashContext({
      current_screen: this.context.currentScreen || 'unknown',
      current_world: this.context.currentWorld || 'unknown',
      current_level: this.context.currentLevel || 0,
      player_level: this.context.playerLevel || 0,
      selected_unit: this.context.selectedUnit || 'unknown',
      selected_weapon: this.context.selectedWeapon || 'unknown',
      app_version: this.appInfo.appVersion,
    });
  }

  private setCrashContext(values: Record<string, string | number | boolean>): void {
    Object.entries(values).forEach(([name, value]) => NativeFirebase.setCustomKey(name, value));
  }

  updatePlayerProperties(input: { playerLevel: number; currentWorld: string; highestLevelReached: number; payerStatus?: 'non_payer' | 'payer' }): void {
    NativeFirebase.setUserProperty('current_world', input.currentWorld);
    NativeFirebase.setUserProperty('player_level', String(input.playerLevel));
    NativeFirebase.setUserProperty('highest_level_reached', String(input.highestLevelReached));
    NativeFirebase.setUserProperty('payer_status', input.payerStatus || 'non_payer');
    this.setContext({ currentWorld: input.currentWorld, playerLevel: input.playerLevel, currentLevel: input.playerLevel });
  }

  trackFirstOpen(): void {
    let firstOpen = false;
    try {
      firstOpen = !localStorage.getItem(FIRST_OPEN_KEY);
      if (firstOpen) localStorage.setItem(FIRST_OPEN_KEY, 'true');
    } catch { /* Firebase's automatic first_open still remains available natively. */ }
    if (firstOpen) this.breadcrumb('First app open');
  }

  trackScreen(screen: string): void {
    if (screen === this.lastScreen) return;
    this.lastScreen = screen;
    this.setContext({ currentScreen: screen });
    this.breadcrumb(`${screen} opened`);
    if (screen === 'lobby') this.trackLobbyOpen();
    if (screen === 'map') this.trackWorldMapOpen();
    if (screen === 'shop') this.trackShopOpen();
    if (screen === 'crystal') this.emit(AnalyticsEvents.crystalChallengeOpen);
  }

  trackLobbyOpen(): void { this.emit(AnalyticsEvents.lobbyOpen); }
  trackWorldMapOpen(): void { this.emit(AnalyticsEvents.worldMapOpen); }
  trackShopOpen(): void { this.emit(AnalyticsEvents.shopOpen); }
  trackCrystalChallengeOpen(): void { this.emit(AnalyticsEvents.crystalChallengeOpen); }
  trackWorldSelected(world: string, selectedLevel: number): void {
    this.setContext({ currentWorld: world, currentLevel: selectedLevel });
    this.breadcrumb(`${world} world selected, level ${selectedLevel}`);
  }
  trackPlayClicked(level: number, world: string): void { this.emit(AnalyticsEvents.playClick, { level, world }); }
  trackLevelStart(input: LevelAnalyticsInput): void {
    if (this.startedBattleIds.has(input.battleId)) return;
    const attempt = nextAttempt(input.level);
    this.attemptsByBattleId.set(input.battleId, attempt);
    this.startedBattleIds.add(input.battleId);
    this.setContext({ currentScreen: 'battle', currentWorld: input.world, currentLevel: input.level, playerLevel: input.playerLevel, selectedUnit: input.selectedUnit, selectedWeapon: input.selectedWeapon, unitLevel: input.unitLevel, weaponLevel: input.weaponLevel });
    this.emit(AnalyticsEvents.levelStart, { level: input.level, world: input.world, attempt, player_level: input.playerLevel, selected_unit: input.selectedUnit, selected_weapon: input.selectedWeapon, unit_level: input.unitLevel, weapon_level: input.weaponLevel, challenge: Boolean(input.challenge) });
    this.breadcrumb(`Level ${input.level} started`);
    if (input.level % 10 === 0) this.emit(AnalyticsEvents.bossStart, { world: input.world, level: input.level, boss_id: `world_${Math.ceil(input.level / 10)}_boss`, attempt });
  }

  trackLevelComplete(input: LevelFinishAnalyticsInput): void {
    if (this.finishedBattleIds.has(input.battleId)) return;
    this.finishedBattleIds.add(input.battleId);
    const attempt = this.attemptsByBattleId.get(input.battleId) || 1;
    this.emit(AnalyticsEvents.levelComplete, { level: input.level, world: input.world, attempt, duration_seconds: input.durationSeconds, coins_earned: input.coinsEarned || 0, gems_earned: input.gemsEarned || 0, player_level: input.playerLevel, selected_unit: input.selectedUnit, selected_weapon: input.selectedWeapon, unit_level: input.unitLevel, weapon_level: input.weaponLevel, challenge: Boolean(input.challenge) });
    if (input.level % 10 === 0) this.emit(AnalyticsEvents.bossComplete, { world: input.world, level: input.level, boss_id: `world_${Math.ceil(input.level / 10)}_boss`, duration: input.durationSeconds, attempt });
    if (input.challenge) this.emit(AnalyticsEvents.crystalChallengeComplete, { level: input.level, world: input.world, duration_seconds: input.durationSeconds, result: 'complete' });
    this.breadcrumb(`Level ${input.level} completed`);
  }

  trackLevelFailed(input: LevelFinishAnalyticsInput): void {
    if (this.finishedBattleIds.has(input.battleId)) return;
    this.finishedBattleIds.add(input.battleId);
    const attempt = this.attemptsByBattleId.get(input.battleId) || 1;
    this.emit(AnalyticsEvents.levelFailed, { level: input.level, world: input.world, attempt, duration_seconds: input.durationSeconds, failure_reason: input.failureReason || 'battle_lost', player_level: input.playerLevel, unit_level: input.unitLevel, weapon_level: input.weaponLevel, selected_unit: input.selectedUnit, selected_weapon: input.selectedWeapon, challenge: Boolean(input.challenge) });
    if (input.level % 10 === 0) this.emit(AnalyticsEvents.bossFailed, { world: input.world, level: input.level, boss_id: `world_${Math.ceil(input.level / 10)}_boss`, duration: input.durationSeconds, attempt });
    this.breadcrumb(`Level ${input.level} failed`);
  }

  trackUpgrade(kind: 'unit' | 'weapon', input: { itemId: string; oldLevel: number; newLevel: number; currency: string; cost: number }): void {
    this.emit(kind === 'unit' ? AnalyticsEvents.unitUpgrade : AnalyticsEvents.weaponUpgrade, { item_id: input.itemId, old_level: input.oldLevel, new_level: input.newLevel, currency: input.currency, cost: input.cost });
  }
  trackSkinSelected(input: { skinId: string; unit: string; gemCost?: number }): void { this.emit(AnalyticsEvents.skinSelected, { skin_id: input.skinId, unit: input.unit, gem_cost: input.gemCost || 0 }); }
  trackBoostUsed(input: { type: string; level: number; world: string }): void { this.emit(AnalyticsEvents.boostUsed, { boost_type: input.type, level: input.level, world: input.world }); }
  trackDailyReward(input: { day: number; booster?: string | null }): void { this.emit(AnalyticsEvents.dailyRewardClaimed, { day: input.day, booster: input.booster || 'none' }); }
  trackMissionComplete(input: { period: string; missionIndex: number; coins: number; gems: number }): void { this.emit(AnalyticsEvents.missionCompleted, { period: input.period, mission_index: input.missionIndex, coins_earned: input.coins, gems_earned: input.gems }); }

  trackPromoView(source: string, remainingSeconds: number): void { const key = `promo_view:${source}`; if (this.promoViews.has(key)) return; this.promoViews.add(key); this.emit(AnalyticsEvents.promoView, { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds }); }
  trackPromoClick(source: string, remainingSeconds: number): void { this.emit(AnalyticsEvents.promoClick, { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds }); }
  trackPromoClose(source: string, remainingSeconds: number): void { this.emit(AnalyticsEvents.promoClosed, { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds }); }
  trackPromoPurchaseStarted(source: string, remainingSeconds: number): void { this.emit(AnalyticsEvents.promoPurchaseStarted, { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds }); }
  trackPromoPurchaseSuccess(source: string, remainingSeconds: number, transactionId: string): void {
    const params = { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds, transaction_id: transactionId };
    this.emit(AnalyticsEvents.promoPurchaseSuccess, params, `promo_success:${transactionId}`);
    this.emit('purchase', { transaction_id: transactionId, affiliation: 'in_game', value: 2.99, currency: 'USD', item_name: 'starter_pack' }, `firebase_purchase:${transactionId}`);
    NativeFirebase.setUserProperty('payer_status', 'payer');
  }
  trackPromoPurchaseFailed(source: string, remainingSeconds: number, reason: string): void { this.emit(AnalyticsEvents.promoPurchaseFailed, { ...STARTER_PACK_PARAMS, source, remaining_seconds: remainingSeconds, reason }); }
  trackPurchaseStarted(input: { productId: string; title: string; priceUsd: number; transactionId: string; status: string }): void { this.emit('purchase_started', { product_id: input.productId, item_name: input.title, price: input.priceUsd, currency: 'USD', transaction_id: input.transactionId, status: input.status }); }

  track(name: string, params?: AnalyticsParams): void {
    if (name === 'daily_reward_claimed') { this.trackDailyReward({ day: Number(params?.day) || 0, booster: typeof params?.booster === 'string' ? params.booster : null }); return; }
    if (name === 'mission_claimed') { this.trackMissionComplete({ period: String(params?.period || 'daily'), missionIndex: Number(params?.index) || 0, coins: Number(params?.reward) || 0, gems: Number(params?.gems) || 0 }); return; }
    if (name === 'skin_equipped') { this.trackSkinSelected({ skinId: String(params?.id || 'default'), unit: String(params?.unit || 'unit_0'), gemCost: Number(params?.gemCost) || 0 }); return; }
    this.emit(name, params);
  }
  reportError(error: unknown, context: AnalyticsParams = {}): void {
    const message = error instanceof Error ? error.message : String(error);
    const name = error instanceof Error ? error.name : 'Error';
    this.setCrashContext(Object.fromEntries(Object.entries(sanitizeParams(context)).map(([key, value]) => [key, String(value)])));
    this.breadcrumb(`Non-fatal ${name}: ${message}`);
    NativeFirebase.recordException(message.slice(0, 1000), name);
    if (import.meta.env.DEV) console.error('[error-report]', error, context);
  }
  async sendDebugTest(): Promise<void> { this.emit(AnalyticsEvents.debugTest, { timestamp: Date.now() }); }
  isDebugBuild(): boolean { return import.meta.env.DEV || this.appInfo.debugBuild; }
  async triggerTestCrash(): Promise<void> { await NativeFirebase.testCrash(); }
}

export const AnalyticsService = new MoboAnalyticsService();

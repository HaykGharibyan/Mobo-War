import type { AnalyticsParams } from './analyticsTypes';

export const AnalyticsEvents = {
  lobbyOpen: 'lobby_open',
  playClick: 'play_click',
  worldMapOpen: 'world_map_open',
  levelStart: 'level_start',
  levelComplete: 'level_complete',
  levelFailed: 'level_failed',
  bossStart: 'boss_start',
  bossComplete: 'boss_complete',
  bossFailed: 'boss_failed',
  unitUpgrade: 'unit_upgrade',
  weaponUpgrade: 'weapon_upgrade',
  skinSelected: 'skin_selected',
  boostUsed: 'boost_used',
  shopOpen: 'shop_open',
  promoView: 'promo_view',
  promoClick: 'promo_click',
  promoClosed: 'promo_closed',
  promoPurchaseStarted: 'promo_purchase_started',
  promoPurchaseSuccess: 'promo_purchase_success',
  promoPurchaseFailed: 'promo_purchase_failed',
  dailyRewardClaimed: 'daily_reward_claimed',
  missionCompleted: 'mission_completed',
  crystalChallengeOpen: 'crystal_challenge_open',
  crystalChallengeComplete: 'crystal_challenge_complete',
  debugTest: 'analytics_test',
} as const;

export const STARTER_PACK_PARAMS = {
  offer_id: 'starter_pack',
  price: 2.99,
  currency: 'USD',
} as const satisfies AnalyticsParams;

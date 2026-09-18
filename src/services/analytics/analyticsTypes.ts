export type AnalyticsValue = string | number | boolean | null | undefined;
export type AnalyticsParams = Record<string, AnalyticsValue>;

export type GameplayAnalyticsContext = {
  currentScreen?: string;
  currentWorld?: string;
  currentLevel?: number;
  playerLevel?: number;
  selectedUnit?: string;
  selectedWeapon?: string;
  unitLevel?: number;
  weaponLevel?: number;
};

export type LevelAnalyticsInput = {
  battleId: string;
  level: number;
  world: string;
  playerLevel: number;
  selectedUnit: string;
  selectedWeapon: string;
  unitLevel: number;
  weaponLevel: number;
  challenge?: boolean;
};

export type LevelFinishAnalyticsInput = LevelAnalyticsInput & {
  durationSeconds: number;
  coinsEarned?: number;
  gemsEarned?: number;
  failureReason?: string;
};

export type NativeFirebaseStatus = {
  available: boolean;
  appVersion: string;
  buildNumber: string;
  packageName: string;
  debugBuild: boolean;
};

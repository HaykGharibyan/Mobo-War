export const ECONOMY={startingCoins:500,startingGems:20,baseBattleCoins:420,starBonus:70,battleRewardGrowth:1.1,upgradeBaseCost:1040,upgradeGrowth:1.28,maxUpgradeLevel:20,maxCampaignLevel:50};
const UNIT_UNLOCK_COSTS=[0,6500,18000] as const;
const WEAPON_UNLOCK_COSTS=[0,5000,22000] as const;
export function unlockCost(kind:'unit'|'weapon',index:number){return (kind==='unit'?UNIT_UNLOCK_COSTS:WEAPON_UNLOCK_COSTS)[index]||0}
const UPGRADE_START_COSTS=[ECONOMY.upgradeBaseCost,2000,4500] as const;
export function upgradeCost(level:number,index=0){const start=UPGRADE_START_COSTS[Math.max(0,Math.min(UPGRADE_START_COSTS.length-1,index))]||ECONOMY.upgradeBaseCost;return Math.round(start*Math.pow(ECONOMY.upgradeGrowth,Math.max(0,level-1)))}

import { UNITS } from '../data/units';
import { WEAPONS } from '../data/weapons';
import { getWorldByLevel } from '../worlds/WorldConfig';

export type Loadout = { level:number; unitIndex:number; weaponIndex:number; unitLevel:number; weaponLevel:number; challenge?:boolean; skin?:'default'|'ninja'|'knight'|'cyber'|'golden'|'blackgold'; boosters?:Record<Booster,number> };
export type Team = 'blue' | 'red';
export type Booster = 'freeze' | 'army' | 'blast';
export type UnitStats = { hp:number; damage:number; attackSpeed:number; moveSpeed:number; attackRange:number };
// Keep the current squad composition readable while reducing the total count by 30%.
export const SQUAD_SIZE={playerDivisor:3.57,enemyDivisor:2.14} as const;
// The playable road is a shallow trapezoid: slightly wider near the enemy gate
// and slightly narrower around the player's cannon. The margins keep every
// unit's sprite away from the stone fence while preserving the visual lanes.
export const FIELD = { width:390, height:780, minX:42, maxX:348, unitMinX:72, unitMaxX:318, cannonY:680, baseY:145, capacity:280, limit:110 };
const ROAD_TOP={min:66,max:324};
const ROAD_BOTTOM={min:78,max:312};
export function roadBoundsAt(y:number){const t=Math.max(0,Math.min(1,(y-FIELD.baseY)/(FIELD.cannonY-FIELD.baseY)));return {min:ROAD_TOP.min+(ROAD_BOTTOM.min-ROAD_TOP.min)*t,max:ROAD_TOP.max+(ROAD_BOTTOM.max-ROAD_TOP.max)*t}}
export const ENEMIES:Record<string,UnitStats> = {
  basic:{hp:52,damage:11,attackSpeed:1.1,moveSpeed:25,attackRange:20},
  fast:{hp:32,damage:8,attackSpeed:1.8,moveSpeed:44,attackRange:18},
  tank:{hp:165,damage:23,attackSpeed:.7,moveSpeed:17,attackRange:25},
  miniBoss:{hp:240,damage:28,attackSpeed:.82,moveSpeed:19,attackRange:28},
  boss:{hp:390,damage:38,attackSpeed:.7,moveSpeed:16,attackRange:30},
};
// Global campaign tuning: every enemy receives the same 15% strength increase.
// Keeping it in the shared scale also affects mini-bosses and bosses without
// changing their individual visual or special multipliers below.
const ENEMY_STRENGTH_MULTIPLIER=1.15;
const ENEMY_WEAKNESS_ADJUSTMENT=.95;
const WORLD_BOSS_SCALE:Record<string,number>={green:1,ice:1.08,dark:1.16,wasteland:1.24,lava:1.34};
const SKIN_BONUS:Record<NonNullable<Loadout['skin']>,number>={default:0,ninja:.05,knight:.1,cyber:.15,golden:.2,blackgold:.4};
export function battleConfig(loadout:Loadout) {
  const level=Math.max(1,Math.floor(loadout.level));
  const unit=[UNITS.basic,UNITS.runner,UNITS.tank][loadout.unitIndex]||UNITS.basic;
  const weapon=[WEAPONS.pulse,WEAPONS.rapid,WEAPONS.plasma][loadout.weaponIndex]||WEAPONS.pulse;
  const growth=1+Math.max(0,loadout.unitLevel-1)*.12;
  const scale=1+Math.min(199,level-1)*.045;
  const world=getWorldByLevel(level),bossScale=WORLD_BOSS_SCALE[world.key]||1,skinBonus=SKIN_BONUS[loadout.skin||'default']||0;
  return {
    level, chapter:Math.ceil(level/10), world, title:world.name.toUpperCase(), bossScale,
    unit:{hp:unit.health*.55*growth*1.5*(1+skinBonus),damage:unit.damage*.65*growth*2*(1+skinBonus)*(loadout.unitIndex===1?1.3:1),attackSpeed:unit.attackSpeed,moveSpeed:(34+unit.speed*6)*(1+skinBonus),attackRange:20},
    spawnInterval:SQUAD_SIZE.playerDivisor/Math.min(9,weapon.spawnRate*(1+Math.max(0,loadout.weaponLevel-1)*.04)),
    shotInterval:weapon.fireRate, shotDamage:weapon.damageBonus*.154*(1+Math.max(0,loadout.weaponLevel-1)*.12),
    splash:loadout.weaponIndex===2, baseHp:Math.round(1800*scale), playerHp:200, armorBonus:skinBonus, scale, enemyScale:scale*1.2*1.15*1.1*ENEMY_STRENGTH_MULTIPLIER*ENEMY_WEAKNESS_ADJUSTMENT*(loadout.challenge?1.25:1),
    // Dense, readable squads: enough pressure to make every gate decision matter.
    waves:[{at:0,count:22+Math.min(18,level*2),lane:195},{at:7,count:20+Math.min(20,level*2),lane:285},{at:17,count:18+Math.min(22,level*2),lane:105}],
    miniBoss:level%5===0&&level%10!==0,
    boss:level%10===0,
  };
}

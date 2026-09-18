import basicFront from '../../assets/bot-basic-hd.webp';
import basicBack from '../../assets/bot-basic-back-hd.webp';
import runnerFront from '../../assets/bot-runner-hd.webp';
import runnerBack from '../../assets/bot-runner-back-hd.webp';
import tankFront from '../../assets/bot-tank-hd.webp';
import tankBack from '../../assets/bot-tank-back-simple-hd.webp';

export const PLAYER_KINDS=['basic','runner','tank'] as const;
export type PlayerKind=(typeof PLAYER_KINDS)[number];
export const PLAYER_SKINS=['default','ninja','knight','cyber','golden','blackgold'] as const;
export type PlayerSkin=(typeof PLAYER_SKINS)[number];
export type PlayerView='front'|'back';

const generatedWebp=import.meta.glob('../../assets/bot-*-skin-*-*.webp',{eager:true,import:'default'}) as Record<string,string>;
const defaults:Record<PlayerKind,Record<PlayerView,string>>={
  basic:{front:basicFront,back:basicBack},
  runner:{front:runnerFront,back:runnerBack},
  tank:{front:tankFront,back:tankBack},
};

/** A single asset source is shared by the customisation cards, loadout and battle. */
export function getPlayerSkinArt(kind:PlayerKind,skin:PlayerSkin='default',view:PlayerView='front'){
  if(skin==='default')return defaults[kind][view];
  const key=`../../assets/bot-${kind}-skin-${skin}-${view}`;
  return generatedWebp[`${key}.webp`]||defaults[kind][view];
}

import greenIsland from '../../assets/island-green.webp';
import frozenIsland from '../../assets/frozen-iceland.webp';
import darkIsland from '../../assets/island-dark.webp';
import wastelandIsland from '../../assets/wasterland.webp';
import lavaIsland from '../../assets/lava realm.webp';
import type { WorldTheme } from './WorldConfig';

const WORLD_ISLAND_ASSETS:Record<string,string>={
  green:greenIsland,
  ice:frozenIsland,
  dark:darkIsland,
  wasteland:wastelandIsland,
  lava:lavaIsland,
};

export function getWorldIslandAsset(world:WorldTheme){
  return WORLD_ISLAND_ASSETS[world.key]||greenIsland;
}

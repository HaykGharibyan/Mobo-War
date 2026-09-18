import type { WorldTheme } from './WorldConfig';

export type LevelNodeType='normal'|'current'|'completed'|'locked'|'elite'|'boss'|'nextWorldNode'|'previousWorldNode';
export type WorldMapNode={id:string;worldId:number;level?:number;type:LevelNodeType;x:number;y:number;label:string;icon:string;targetWorldId?:number};

const layouts:Record<string,Array<[number,number]>>={
  green:[[57,75],[45,70],[32,65],[35,59],[53,54],[64,48],[70,43],[61,37],[51,32],[53,27]],
  ice:[[58,85],[66,72],[53,65],[42,59],[53,53],[60,47],[66,41],[66,35],[57,29],[56,23]],
  dark:[[53,84],[40,81],[53,74],[43,67],[51,60],[57,53],[59,46],[64,39],[53,33],[51,27]],
  wasteland:[[61,84],[53,79],[58,72],[48,65],[52,58],[61,51],[66,44],[59,37],[52,31],[49,26]],
  lava:[[60,84],[70,79],[58,72],[43,65],[60,60],[56,51],[67,44],[74,37],[76,30],[81,24]],
};

export function getWorldMapNodes(world:WorldTheme,unlockedLevel:number):WorldMapNode[]{
  const layout=layouts[world.key]||layouts.green;
  const levels=layout.map(([x,y],index)=>{const level=world.levelStart+index;const type:LevelNodeType=level===world.levelEnd?'boss':level<unlockedLevel?'completed':level===unlockedLevel?'current':'locked';return {id:`level-${level}`,worldId:world.id,level,type,x,y,label:`Level ${level}`,icon:String(level)} });
  const nodes:WorldMapNode[]=[];
  if(world.previousWorldId){const previousIcon=world.previousWorldId===1?'🌿':world.previousWorldId===2?'🧊':world.previousWorldId===3?'🍄':'🏜️';nodes.push({id:`previous-${world.id}`,worldId:world.id,type:'previousWorldNode',x:19,y:91,label:`World ${world.previousWorldId}`,icon:previousIcon,targetWorldId:world.previousWorldId});}
  nodes.push(...levels);
  if(world.nextWorldId){const nextIcon=world.nextWorldId===2?'🧊':world.nextWorldId===3?'🍄':world.nextWorldId===4?'🏜️':'🌋';nodes.push({id:`next-${world.id}`,worldId:world.id,type:'nextWorldNode',x:82,y:8,label:`World ${world.nextWorldId}`,icon:nextIcon,targetWorldId:world.nextWorldId});}
  return nodes;
}

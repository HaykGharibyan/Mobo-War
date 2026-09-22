export type WorldTheme={
  id:number;key:string;name:string;levelStart:number;levelEnd:number;difficultyTier:string;nextWorldId?:number;previousWorldId?:number;
  mapTheme:{gradient:string;accent:string;decor:string;glow:string};
  battlefieldTheme:{sky:string[];ground:string;road:string;roadEdge:string;trim:string;decor:string;mist:string};
  environmentProps:string[];particleStyle:'leaves'|'snow'|'mist'|'dust'|'ash';lighting:string;portalColor:number;enemyTint:number;bossColor:number;
};

export const WORLDS:WorldTheme[]=[
  {id:1,key:'green',name:'Green Kingdom',levelStart:1,levelEnd:10,difficultyTier:'Easy',nextWorldId:2,mapTheme:{gradient:'linear-gradient(180deg,#82dcf0 0%,#80d9f0 38%,#55aa69 100%)',accent:'#25c879',decor:'🌲　💧　🏰　🌿',glow:'#fff5a855'},battlefieldTheme:{sky:['#86e5f3','#40c8cf'],ground:'#67ae58',road:'#edca91',roadEdge:'#f8e3b5',trim:'#4c8b69',decor:'#d7f4a0',mist:'#ffffff12'},environmentProps:['trees','waterfalls','bridges','castle'],particleStyle:'leaves',lighting:'#fff4c455',portalColor:0x35c9ff,enemyTint:0xff5d70,bossColor:0xffc735},
  {id:2,key:'ice',name:'Frozen Lands',levelStart:11,levelEnd:20,difficultyTier:'Easy / Normal',nextWorldId:3,previousWorldId:1,mapTheme:{gradient:'linear-gradient(180deg,#b9f3ff 0%,#b9f3ff 42%,#285b96 100%)',accent:'#7ae9ff',decor:'❄️　🏔️　🧊　🌲',glow:'#cfffff77'},battlefieldTheme:{sky:['#b9f4ff','#5aa7d9'],ground:'#8cc7dc',road:'#dcecf1',roadEdge:'#8beaff',trim:'#4d93bb',decor:'#dfffff',mist:'#c7f7ff2b'},environmentProps:['snow','iceLakes','frozenBridge','iceFortress'],particleStyle:'snow',lighting:'#c7f5ff55',portalColor:0x7deaff,enemyTint:0xff718b,bossColor:0x8cecff},
  {id:3,key:'dark',name:'Dark Forest',levelStart:21,levelEnd:30,difficultyTier:'Normal',nextWorldId:4,previousWorldId:2,mapTheme:{gradient:'linear-gradient(180deg,#29416c 0%,#2d4262 36%,#171d3e 100%)',accent:'#ad76ff',decor:'🌲　🍄　🗿　✨',glow:'#b76dff44'},battlefieldTheme:{sky:['#34436b','#161b3d'],ground:'#263b35',road:'#58606c',roadEdge:'#8b779d',trim:'#202b3f',decor:'#b46aff',mist:'#9a55c72b'},environmentProps:['ruins','roots','mushrooms','statues'],particleStyle:'mist',lighting:'#a86cff2c',portalColor:0xb477ff,enemyTint:0xd95886,bossColor:0xd767ff},
  {id:4,key:'wasteland',name:'Wasteland',levelStart:31,levelEnd:40,difficultyTier:'Hard',nextWorldId:5,previousWorldId:3,mapTheme:{gradient:'linear-gradient(180deg,#e3a263 0%,#e4a268 42%,#4b3440 100%)',accent:'#ffbd55',decor:'🏜️　🪨　🛡️　💨',glow:'#ffcf7044'},battlefieldTheme:{sky:['#d99a60','#9a5043'],ground:'#9d694b',road:'#bf8b62',roadEdge:'#e2b57a',trim:'#66454a',decor:'#e8c15e',mist:'#f5bd7530'},environmentProps:['canyons','barricades','dryRiver','ruins'],particleStyle:'dust',lighting:'#ffc06a3d',portalColor:0xffbd62,enemyTint:0xf27a56,bossColor:0xff9d38},
  {id:5,key:'lava',name:'Lava Realm',levelStart:41,levelEnd:50,difficultyTier:'Very Hard',previousWorldId:4,mapTheme:{gradient:'linear-gradient(180deg,#5d2738 0%,#612d2d 42%,#120e1d 100%)',accent:'#ff6b35',decor:'🌋　🔥　🪨　⚫',glow:'#ff4d2f66'},battlefieldTheme:{sky:['#60283a','#1c1020'],ground:'#321e29',road:'#42313a',roadEdge:'#8f493d',trim:'#1b1421',decor:'#ff713b',mist:'#ff43252b'},environmentProps:['lava','magmaCracks','volcano','burningTowers'],particleStyle:'ash',lighting:'#ff5a363b',portalColor:0xff7a3d,enemyTint:0xc83d55,bossColor:0xff542d},
];

export function getWorldById(id:number){return WORLDS.find(world=>world.id===id)||WORLDS[0]}

export function getWorldByLevel(level:number):WorldTheme{
  const safe=Math.max(1,Math.floor(level));
  return WORLDS.find(world=>safe>=world.levelStart&&safe<=world.levelEnd)||WORLDS[WORLDS.length-1];
}

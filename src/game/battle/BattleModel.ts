import { battleConfig, ENEMIES, FIELD, roadBoundsAt, SQUAD_SIZE, type Loadout, type Team, type Booster, type UnitStats } from './config';
import { SpatialGrid } from './SpatialGrid';
import type { GateDirectorCheckpoint } from './GateDirector';

export type Unit = UnitStats & {id:number;active:boolean;x:number;y:number;laneX:number;gateEventId:number;team:Team;kind:string;state:'run'|'attack'|'dead';cooldown:number;mask:number;maxHp:number;hit:number};
export type Shot={active:boolean;x:number;y:number;vx:number;vy:number};
export type BattleSnapshot={army:number;enemies:number;baseHp:number;baseMax:number;playerHp:number;time:number;progress:number;kills:number;wave:number;phase:string;boosters:Record<Booster,number>};
export type BattleOutcome={id:string;level:number;result:'victory'|'defeat';stars:number;kills:number;seconds:number;challenge?:boolean};
export type BattleCheckpoint={cannonX:number;aimAngle?:number;baseHp:number;playerHp:number;time:number;kills:number;wave:number;freezeUntil:number;spawnClock:number;shotClock:number;seed:number;nextUnitId:number;boosters:Record<Booster,number>;units:Unit[];shots:Shot[];gates?:GateDirectorCheckpoint};
export type Effect=(kind:'spawn'|'shoot'|'hit'|'death'|'bossDeath'|'bossSpawn'|'gate'|'base'|'victory'|'defeat',x:number,y:number,team?:Team)=>void;
const PLAYER_BASE_ATTACK_Y=FIELD.cannonY-30;

export class BattleModel {
  readonly config; readonly units:Unit[]; readonly shots:Shot[];
  readonly grid=new SpatialGrid(); readonly boosters:Record<Booster,number>;
  cannonX=195; aimAngle=0; baseHp:number; playerHp:number; time=0; kills=0; wave=0; result:BattleOutcome|null=null;
  private freezeUntil=0; private spawnClock=0; private shotClock=0; private seed:number; private id=0;
  private blueCount=0; private redCount=0;
  constructor(readonly loadout:Loadout,readonly battleId:string,private effect:Effect=()=>{},checkpoint?:BattleCheckpoint){
    this.config=battleConfig(loadout);this.seed=loadout.level*7919+17;this.baseHp=this.config.baseHp;this.playerHp=this.config.playerHp;this.boosters={freeze:loadout.boosters?.freeze??2,army:loadout.boosters?.army??1,blast:loadout.boosters?.blast??1};
    this.units=Array.from({length:FIELD.capacity},(_,id)=>({id,active:false,x:0,y:0,laneX:0,gateEventId:0,team:'blue',kind:'basic',state:'dead',hp:0,maxHp:0,damage:0,attackSpeed:1,moveSpeed:0,attackRange:20,cooldown:0,mask:0,hit:0}));
    this.shots=Array.from({length:36},()=>({active:false,x:0,y:0,vx:0,vy:-350}));
    if(checkpoint)this.restore(checkpoint);
    else{for(let i=0;i<Math.round(6/SQUAD_SIZE.playerDivisor);i++)this.spawn('blue',this.cannonX+(i-.5)*18,638,'basic');this.emitWave()}
  }
  private restore(checkpoint:BattleCheckpoint){
    this.cannonX=checkpoint.cannonX;this.aimAngle=checkpoint.aimAngle||0;this.baseHp=checkpoint.baseHp;this.playerHp=Math.max(50,Math.min(this.config.playerHp,checkpoint.playerHp));this.time=Math.min(checkpoint.time,FIELD.limit-30);this.kills=checkpoint.kills;this.wave=checkpoint.wave;this.freezeUntil=checkpoint.freezeUntil;this.spawnClock=checkpoint.spawnClock;this.shotClock=checkpoint.shotClock;this.seed=checkpoint.seed;this.id=checkpoint.nextUnitId;Object.assign(this.boosters,checkpoint.boosters);
    this.blueCount=0;this.redCount=0;
    for(let index=0;index<this.units.length;index++){const saved=checkpoint.units[index];if(saved)Object.assign(this.units[index],saved);if(this.units[index].active){if(this.units[index].team==='blue')this.blueCount++;else this.redCount++}}
    for(let index=0;index<this.shots.length;index++){const saved=checkpoint.shots[index];if(saved)Object.assign(this.shots[index],saved)}
    // Old checkpoints may contain portals, but the current battle mode has none.
    if(this.blueCount===0)for(let i=0;i<Math.round(12/SQUAD_SIZE.playerDivisor);i++)this.spawn('blue',this.cannonX+(i%3-1)*17,638-Math.floor(i/3)*16,'basic');
  }
  checkpoint():BattleCheckpoint{return {cannonX:this.cannonX,aimAngle:this.aimAngle,baseHp:this.baseHp,playerHp:this.playerHp,time:this.time,kills:this.kills,wave:this.wave,freezeUntil:this.freezeUntil,spawnClock:this.spawnClock,shotClock:this.shotClock,seed:this.seed,nextUnitId:this.id,boosters:{...this.boosters},units:this.units.map(unit=>({...unit})),shots:this.shots.map(shot=>({...shot}))}}
  private random(){this.seed=(Math.imul(this.seed,1664525)+1013904223)|0;return (this.seed>>>0)/4294967296}
  moveCannon(x:number){const road=roadBoundsAt(FIELD.cannonY);this.cannonX=Math.max(road.min+10,Math.min(road.max-10,x))}
  spawn(team:Team,x:number,y:number,kind='basic',mask=0):Unit|undefined{
    if(team==='blue'&&this.blueCount>=210)return;
    let u:Unit|undefined;for(let i=0;i<this.units.length;i++){const candidate=this.units[(this.id+i)%this.units.length];if(!candidate.active){u=candidate;this.id=(candidate.id+1)%this.units.length;break}}
    if(!u)return;
    const stats=team==='blue'?this.config.unit:ENEMIES[kind]||ENEMIES.basic;
    const road=roadBoundsAt(y),laneX=Math.max(road.min+10,Math.min(road.max-10,x));
    Object.assign(u,stats,{active:true,x:laneX,y,laneX,gateEventId:0,team,kind,state:'run',cooldown:this.random()*.3,mask,hit:0});
    if(team==='red'){
      u.hp*=this.config.enemyScale;u.damage*=this.config.enemyScale;
      if(kind==='miniBoss'){u.hp*=1.55*this.config.bossScale;u.damage*=1.2*this.config.bossScale}
      if(kind==='boss'){u.hp*=2.35*1.3*2*this.config.bossScale;u.damage*=1.45*1.3*2*this.config.bossScale}
    }
    u.maxHp=u.hp;if(team==='blue')this.blueCount++;else this.redCount++;return u;
  }
  private emitWave(){const wave=this.config.waves[this.wave];if(!wave)return;for(let i=0;i<Math.round(wave.count/SQUAD_SIZE.enemyDivisor);i++){
    const kind=i%7===0?'tank':i%3===0?'fast':'basic';this.spawn('red',wave.lane+(i%7-3)*17,205-Math.floor(i/7)*17,kind);
  }
    if(this.wave===2){
      if(this.config.miniBoss){this.spawn('red',195,178,'miniBoss');this.spawn('red',163,190,'tank')}
      if(this.config.boss){const boss=this.spawn('red',195,178,'boss');if(boss)this.effect('bossSpawn',boss.x,boss.y,'red');this.spawn('red',158,190,'tank');this.spawn('red',232,190,'tank')}
    }
    this.wave++
  }
  private kill(u:Unit){if(!u.active)return;u.active=false;u.state='dead';if(u.team==='red'){this.kills++;this.redCount--;if(u.kind==='boss'||u.kind==='miniBoss')this.effect('bossDeath',u.x,u.y,u.team)}else this.blueCount--;this.effect('death',u.x,u.y,u.team)}
  private hurt(u:Unit,damage:number){u.hp-=damage;u.hit=.12;this.effect('hit',u.x,u.y,u.team);if(u.hp<=0)this.kill(u)}
  useBooster(type:Booster):boolean{
    if(this.result||this.boosters[type]<=0)return false;
    if(type==='army'&&this.blueCount>=210)return false;
    this.boosters[type]--;
    if(type==='freeze')this.freezeUntil=this.time+2;
    if(type==='army')for(let i=0;i<Math.round(18/SQUAD_SIZE.playerDivisor);i++)this.spawn('blue',this.cannonX+(this.random()-.5)*56,630+this.random()*20);
    if(type==='blast')for(const u of this.units)if(u.active&&u.team==='red')this.hurt(u,65);
    this.effect('gate',this.cannonX,615,'blue');return true;
  }
  update(dt:number){
    if(this.result)return;this.time+=dt;this.spawnClock+=dt;this.shotClock+=dt;
    const weaponX=FIELD.width/2+5;
    let targetAngle=0,nearestShotTarget=Infinity;
    // Keep targeting all living enemies, including those that have reached
    // the player's base. Previously the y<630 cut-off made close enemies
    // untargetable exactly when they became the most urgent threat.
    for(const enemy of this.units)if(enemy.active&&enemy.team==='red'){
      const dx=enemy.x-weaponX,dy=720-enemy.y,angle=Math.atan2(dx,dy);
      const distance=dx*dx+dy*dy;
      if(distance<nearestShotTarget){nearestShotTarget=distance;targetAngle=angle}
    }
    this.aimAngle+=Math.max(-dt*3,Math.min(dt*3,targetAngle-this.aimAngle));
    if(this.wave<this.config.waves.length&&this.time>=this.config.waves[this.wave].at)this.emitWave();
    if(this.time<65&&this.spawnClock>=this.config.spawnInterval){this.spawnClock-=this.config.spawnInterval;this.spawn('blue',this.cannonX+(this.random()-.5)*25,650);this.effect('spawn',this.cannonX,660,'blue')}
    if(this.shotClock>=this.config.shotInterval){this.shotClock=0;const defaultMuzzleDistance=[106,108,106][Math.max(0,Math.min(2,this.loadout.weaponIndex))];
      // The normal muzzle sits ahead of the cannon. For an enemy already
      // close to the cannon that point would be past the target, so shorten
      // the muzzle offset and let the projectile travel through the target.
      const targetDistance=Number.isFinite(nearestShotTarget)?Math.sqrt(nearestShotTarget):Infinity;
      const muzzleDistance=Math.min(defaultMuzzleDistance,Math.max(18,targetDistance-18));
      for(const s of this.shots)if(!s.active){s.active=true;s.x=weaponX+Math.sin(this.aimAngle)*muzzleDistance;s.y=720-Math.cos(this.aimAngle)*muzzleDistance;s.vx=Math.sin(this.aimAngle)*350;s.vy=-Math.cos(this.aimAngle)*350;this.effect('shoot',s.x,s.y);break}}
    this.grid.clear();for(const u of this.units)if(u.active)this.grid.insert(u.id,u.x,u.y);
    for(const u of this.units){
      if(!u.active)continue;u.hit=Math.max(0,u.hit-dt);u.cooldown-=dt;
      if(u.team==='red'&&this.time<this.freezeUntil){u.state='run';continue}
      let target:Unit|undefined,nearest=80*80;let sx=0,sy=0;
      this.grid.visit(u.x,u.y,80,id=>{const v=this.units[id];if(!v.active||v===u)return;const dx=v.x-u.x,dy=v.y-u.y,d2=dx*dx+dy*dy;
        if(v.team!==u.team&&d2<nearest){target=v;nearest=d2}
        else if(v.team===u.team&&d2<169){const d=Math.sqrt(d2)||1;sx-=dx/d*(13-d);sy-=dy/d*(13-d)}
      });
      u.state='run';
      if(target){const dx=target.x-u.x,dy=target.y-u.y,d=Math.sqrt(nearest)||1;
        if(d<=u.attackRange){u.state='attack';if(u.cooldown<=0){u.cooldown=1/u.attackSpeed;this.hurt(target,u.damage)}}
        else{u.x+=dx/d*u.moveSpeed*dt;u.y+=dy/d*u.moveSpeed*dt}
      }else if(u.team==='blue'&&u.y<=FIELD.baseY+37){u.state='attack';if(u.cooldown<=0){u.cooldown=1/u.attackSpeed;this.baseHp=Math.max(0,this.baseHp-u.damage);this.effect('base',u.x,FIELD.baseY)}}
      else if(u.team==='red'&&u.y>=PLAYER_BASE_ATTACK_Y){
        // Enemies remain at our base and keep attacking on their cooldown.
        // They are removed only when the player damages/kills them, matching
        // the same persistent attack logic used against the enemy fortress.
        u.y=PLAYER_BASE_ATTACK_Y;u.state='attack';
        if(u.cooldown<=0){u.cooldown=1/u.attackSpeed;this.playerHp=Math.max(0,this.playerHp-u.damage);this.effect('base',u.x,FIELD.cannonY)}
      }
      else{
        // A bot commits to the lane it spawned in. Steering the cannon only directs future reinforcements.
        if(u.team==='blue')u.x+=(u.laneX-u.x)*Math.min(1,dt*2.4);
        u.y+=(u.team==='blue'?-1:1)*u.moveSpeed*dt;
      }
      const road=roadBoundsAt(u.y);u.x=Math.max(road.min+10,Math.min(road.max-10,u.x+sx*dt*2));if(u.state==='run')u.y+=sy*dt;
      if(u.team==='red'&&u.y>PLAYER_BASE_ATTACK_Y)u.y=PLAYER_BASE_ATTACK_Y;
    }
    for(const s of this.shots){if(!s.active)continue;s.x+=(s.vx||0)*dt;s.y+=(s.vy||-350)*dt;let hit:Unit|undefined;
      this.grid.visit(s.x,s.y,22,id=>{const u=this.units[id];if(!hit&&u.active&&u.team==='red'&&Math.abs(u.x-s.x)<16&&Math.abs(u.y-s.y)<20)hit=u});
      if(hit){s.active=false;this.hurt(hit,this.config.shotDamage);if(this.config.splash)this.grid.visit(s.x,s.y,38,id=>{const u=this.units[id];if(u.active&&u.team==='red'&&u!==hit)this.hurt(u,this.config.shotDamage*.4)})}
      else if(this.redCount===0&&s.y<=FIELD.baseY+20&&Math.abs(s.x-FIELD.width/2)<28){s.active=false;this.baseHp=Math.max(0,this.baseHp-this.config.shotDamage);this.effect('base',s.x,FIELD.baseY)}
      else if(s.y<FIELD.baseY+20||s.x<FIELD.minX||s.x>FIELD.maxX){s.active=false}
    }
    if(this.baseHp<=0)this.finish('victory');else if(this.playerHp<=0||this.time>=FIELD.limit||(this.time>=65&&this.blueCount===0&&this.redCount>0))this.finish('defeat');
  }
  private finish(result:'victory'|'defeat'){
    this.result={id:this.battleId,level:this.config.level,result,stars:result==='defeat'?0:this.playerHp>=80&&this.time<70?3:this.playerHp>=40?2:1,kills:this.kills,seconds:Math.round(this.time),challenge:this.loadout.challenge};
    this.effect(result,195,200);
  }
  snapshot():BattleSnapshot{return {army:this.blueCount,enemies:this.redCount,baseHp:Math.ceil(this.baseHp),baseMax:this.config.baseHp,playerHp:this.playerHp,time:Math.floor(this.time),progress:1-this.baseHp/this.config.baseHp,kills:this.kills,wave:this.wave,phase:this.time<7?'ADVANCE TO CONTACT':this.baseHp<this.config.baseHp?'BREAK THE FORTRESS':this.time>=65?'LAST ASSAULT':'LEAD YOUR ARMY',boosters:{...this.boosters}}}
}

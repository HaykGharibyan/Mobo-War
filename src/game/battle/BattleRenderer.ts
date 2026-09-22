import Phaser from 'phaser';
import { BattleModel, type Effect } from './BattleModel';
import { makeBattleArt } from './BattleArt';
import { makeWeaponRigArt, type WeaponRigKind } from './WeaponRigArt';
import { makeWeaponSpriteArt } from './WeaponSpriteArt';
import { AudioManager } from '../../services/AudioManager';
import { BattleAudioSystem } from '../../services/BattleAudioSystem';
import battleGreen from '../../assets/battle-green.webp';
import battleIce from '../../assets/battle-ice.webp';
import battleDark from '../../assets/battle-dark.webp';
import battleWasteland from '../../assets/battle-wasteland.webp';
import battleLava from '../../assets/battle-lava.webp';
import pulseParts from '../../assets/weapon-pulse-parts.webp';
import rapidParts from '../../assets/weapon-rapid-parts.webp';
import plasmaParts from '../../assets/weapon-plasma-parts.webp';
import { getPlayerSkinArt, type PlayerSkin } from './PlayerSkinAssets';
import enemyGreenBasic from '../../assets/enemy-green-basic.webp';
import enemyGreenFast from '../../assets/enemy-green-fast.webp';
import enemyGreenTank from '../../assets/enemy-green-tank.webp';
import enemyGreenMiniBoss from '../../assets/enemy-green-miniBoss.webp';
import enemyGreenBoss from '../../assets/enemy-green-boss.webp';
import enemyIceBasic from '../../assets/enemy-ice-basic.webp';
import enemyIceFast from '../../assets/enemy-ice-fast.webp';
import enemyIceTank from '../../assets/enemy-ice-tank.webp';
import enemyIceMiniBoss from '../../assets/enemy-ice-miniBoss.webp';
import enemyIceBoss from '../../assets/enemy-ice-boss.webp';
import enemyDarkBasic from '../../assets/enemy-dark-basic.webp';
import enemyDarkFast from '../../assets/enemy-dark-fast.webp';
import enemyDarkTank from '../../assets/enemy-dark-tank.webp';
import enemyDarkMiniBoss from '../../assets/enemy-dark-miniBoss.webp';
import enemyDarkBoss from '../../assets/enemy-dark-boss.webp';
import enemyWastelandBasic from '../../assets/enemy-wasteland-basic.webp';
import enemyWastelandFast from '../../assets/enemy-wasteland-fast.webp';
import enemyWastelandTank from '../../assets/enemy-wasteland-tank.webp';
import enemyWastelandMiniBoss from '../../assets/enemy-wasteland-miniBoss.webp';
import enemyWastelandBoss from '../../assets/enemy-wasteland-boss.webp';
import enemyLavaBasic from '../../assets/enemy-lava-basic.webp';
import enemyLavaFast from '../../assets/enemy-lava-fast.webp';
import enemyLavaTank from '../../assets/enemy-lava-tank.webp';
import enemyLavaMiniBoss from '../../assets/enemy-lava-miniBoss.webp';
import enemyLavaBoss from '../../assets/enemy-lava-boss.webp';
type EnemyVisualKind='basic'|'fast'|'tank'|'miniBoss'|'boss';
type BotMotion={x:number;y:number;phase:number;heading:number};
type WorldParticleFlow='fall'|'rise'|'across';
type WorldParticle={shape:Phaser.GameObjects.Shape;flow:WorldParticleFlow;speed:number;drift:number;sway:number;spin:number;phase:number;opacity:number;scale:number;style:'leaves'|'snow'|'mist'|'dust'|'ash'};
type EnemySkinSet=Record<EnemyVisualKind,string>;
const ENEMY_TEXTURE_KEYS:Record<string,EnemySkinSet>={
  green:{basic:'enemy-skin-basic',fast:'enemy-skin-fast',tank:'enemy-skin-tank',miniBoss:'enemy-skin-miniBoss',boss:'enemy-skin-boss'},
  ice:{basic:'enemy-skin-ice-basic',fast:'enemy-skin-ice-fast',tank:'enemy-skin-ice-tank',miniBoss:'enemy-skin-ice-miniBoss',boss:'enemy-skin-ice-boss'},
  dark:{basic:'enemy-skin-dark-basic',fast:'enemy-skin-dark-fast',tank:'enemy-skin-dark-tank',miniBoss:'enemy-skin-dark-miniBoss',boss:'enemy-skin-dark-boss'},
  wasteland:{basic:'enemy-skin-wasteland-basic',fast:'enemy-skin-wasteland-fast',tank:'enemy-skin-wasteland-tank',miniBoss:'enemy-skin-wasteland-miniBoss',boss:'enemy-skin-wasteland-boss'},
  lava:{basic:'enemy-skin-lava-basic',fast:'enemy-skin-lava-fast',tank:'enemy-skin-lava-tank',miniBoss:'enemy-skin-lava-miniBoss',boss:'enemy-skin-lava-boss'},
};
const ENEMY_SKIN_ASSETS:Record<string,EnemySkinSet>={
  green:{basic:enemyGreenBasic,fast:enemyGreenFast,tank:enemyGreenTank,miniBoss:enemyGreenMiniBoss,boss:enemyGreenBoss},
  ice:{basic:enemyIceBasic,fast:enemyIceFast,tank:enemyIceTank,miniBoss:enemyIceMiniBoss,boss:enemyIceBoss},
  dark:{basic:enemyDarkBasic,fast:enemyDarkFast,tank:enemyDarkTank,miniBoss:enemyDarkMiniBoss,boss:enemyDarkBoss},
  wasteland:{basic:enemyWastelandBasic,fast:enemyWastelandFast,tank:enemyWastelandTank,miniBoss:enemyWastelandMiniBoss,boss:enemyWastelandBoss},
  lava:{basic:enemyLavaBasic,fast:enemyLavaFast,tank:enemyLavaTank,miniBoss:enemyLavaMiniBoss,boss:enemyLavaBoss},
};
const WORLD_ART:Record<string,string>={green:battleGreen,ice:battleIce,dark:battleDark,wasteland:battleWasteland,lava:battleLava};
const WEAPON_PARTS:Record<WeaponRigKind,string>={pulse:pulseParts,rapid:rapidParts,plasma:plasmaParts};

/** All raster files needed for a battle. The loading screen decodes this same list before Phaser mounts. */
export function getBattleAssetUrls(worldKey:string,unitIndex:number,weaponIndex:number,skin:PlayerSkin){
  const kind=(['basic','runner','tank'] as const)[Math.max(0,Math.min(2,unitIndex))]||'basic';
  const weapon=(['pulse','rapid','plasma'] as const)[Math.max(0,Math.min(2,weaponIndex))]||'pulse';
  const enemies=ENEMY_SKIN_ASSETS[worldKey]||ENEMY_SKIN_ASSETS.green;
  return [WORLD_ART[worldKey]||WORLD_ART.green,WEAPON_PARTS[weapon],getPlayerSkinArt(kind,skin,'back'),...Object.values(enemies)];
}

/** Phaser's loader gets the exact same files before `create`, so no placeholder battlefield can flash. */
export function queueBattleAssets(scene:Phaser.Scene,worldKey:string,unitIndex:number,weaponIndex:number,skin:PlayerSkin){
  const weapon=(['pulse','rapid','plasma'] as const)[Math.max(0,Math.min(2,weaponIndex))]||'pulse';
  const kind=(['basic','runner','tank'] as const)[Math.max(0,Math.min(2,unitIndex))]||'basic';
  const enemyKeys=ENEMY_TEXTURE_KEYS[worldKey]||ENEMY_TEXTURE_KEYS.green;
  const enemies=ENEMY_SKIN_ASSETS[worldKey]||ENEMY_SKIN_ASSETS.green;
  scene.load.image(`battle-land-${worldKey}`,WORLD_ART[worldKey]||WORLD_ART.green);
  scene.load.image(`weapon-${weapon}-parts`,WEAPON_PARTS[weapon]);
  scene.load.image(`bot-player-art-${skin}-${kind}-back`,getPlayerSkinArt(kind,skin,'back'));
  for(const enemyKind of ['basic','fast','tank','miniBoss','boss'] as EnemyVisualKind[])scene.load.image(enemyKeys[enemyKind],enemies[enemyKind]);
}
export class BattleRenderer {
  private bots:Phaser.GameObjects.Image[]=[];private shadows:Phaser.GameObjects.Ellipse[]=[];private shots:Phaser.GameObjects.Image[]=[];
  private eliteGlows:Phaser.GameObjects.Arc[]=[];
  private readonly botMotion=new Map<number,BotMotion>();
  private fx:{shape:Phaser.GameObjects.Arc;life:number;duration:number}[]=[];
  private worldParticles:WorldParticle[]=[];
  private weaponBase:Phaser.GameObjects.Image;private weaponTurret:Phaser.GameObjects.Image;private muzzleFlash:Phaser.GameObjects.Arc;private fortress:Phaser.GameObjects.Image;
  private recoil=0;private impact=0;private soundAt=0;private gateAt=0;
  private readonly partsKey:string;private readonly projectileKey:string;private readonly weaponIndex:number;private readonly weaponKind:WeaponRigKind;private flashLife=0;
  constructor(private scene:Phaser.Scene,private model:BattleModel,private sound:boolean){
    makeBattleArt(scene,model.config.world);makeWeaponRigArt(scene);const land=scene.add.image(195,390,'battle-land').setDisplaySize(390,780);
    const worldKey=`battle-land-${model.config.world.key}`;
    if(scene.textures.exists(worldKey))land.setTexture(worldKey).setDisplaySize(390,780);
    this.weaponIndex=Math.max(0,Math.min(2,model.loadout.weaponIndex));
    this.weaponKind=(['pulse','rapid','plasma'] as const)[this.weaponIndex];
    this.partsKey=`weapon-${this.weaponKind}-parts`;
    this.projectileKey=`rig-shot-${this.weaponKind}`;
    const selectedKind=(['basic','runner','tank'] as const)[model.loadout.unitIndex]||'basic';
    const selectedSkin=(model.loadout.skin||'default') as PlayerSkin;
    scene.add.rectangle(195,390,390,780,model.config.world.portalColor,.08);
    this.fortress=scene.add.image(195,138,'battle-fortress').setDisplaySize(230,146).setDepth(9).setTint(model.config.world.bossColor).setVisible(model.config.world.key!=='green'&&model.config.world.key!=='ice'&&model.config.world.key!=='dark'&&model.config.world.key!=='wasteland'&&model.config.world.key!=='lava');
    for(let i=0;i<model.units.length;i++){
      this.shadows.push(scene.add.ellipse(0,0,17,6,0x234451,.18).setVisible(false));
      this.eliteGlows.push(scene.add.circle(0,0,20,model.config.world.bossColor,.1).setVisible(false));
      this.bots.push(scene.add.image(0,0,'bot-blue').setVisible(false).setOrigin(.5,.85));
    }
    for(let i=0;i<model.shots.length;i++)this.shots.push(scene.add.image(0,0,this.projectileKey).setDisplaySize(this.weaponIndex===2?28:16,this.weaponIndex===2?28:32).setVisible(false));
    for(let i=0;i<60;i++)this.fx.push({shape:scene.add.circle(0,0,3,0xffdb51).setVisible(false).setDepth(900),life:0,duration:0});
    this.createWorldParticles();
    this.weaponBase=scene.add.image(195,690,`rig-hull-${this.weaponKind}`).setDisplaySize(110,76).setDepth(750);
    this.weaponTurret=scene.add.image(200,720,`rig-turret-${this.weaponKind}`).setOrigin(.5,.79).setDisplaySize(105,145).setDepth(751);
    const flashColor=this.weaponIndex===2?0xee9aff:this.weaponIndex===1?0xffc36c:0xa0ffff;
    this.muzzleFlash=scene.add.circle(0,0,13,flashColor,.9).setDepth(810).setVisible(false);
    if(scene.textures.exists(this.partsKey)){
      makeWeaponSpriteArt(scene,this.partsKey,this.weaponKind);
      this.weaponBase.setTexture(`battle-weapon-${this.weaponKind}-base`).setOrigin(.5,.5).setDisplaySize(115,154);
      this.weaponTurret.setTexture(`battle-weapon-${this.weaponKind}-turret`).setOrigin(.5,.79).setDisplaySize(115,154);
    }
  }
  private createWorldParticles(){
    const style=this.model.config.world.particleStyle;
    const colors={
      leaves:[0x9cda57,0xefbd54,0xd97843],
      snow:[0xffffff,0xd8f8ff,0x9eeaff],
      mist:[0xdc90ff,0x94baff,0xf4c9ff],
      dust:[0xf0bd72,0xc97840,0xffdc9a],
      ash:[0xffb35c,0xff6438,0xc29386]
    }[style];
    const count={leaves:14,snow:26,mist:13,dust:15,ash:19}[style];
    for(let index=0;index<count;index++){
      const phase=Math.random()*Math.PI*2;
      const color=colors[index%colors.length];
      const opacity=style==='snow'?.42+Math.random()*.32:style==='mist'?.16+Math.random()*.2:.26+Math.random()*.28;
      let shape:Phaser.GameObjects.Shape;
      if(style==='leaves')shape=this.scene.add.ellipse(0,0,4+Math.random()*2.5,7+Math.random()*4,color,opacity).setAngle(Math.random()*180);
      else if(style==='dust')shape=this.scene.add.ellipse(0,0,8+Math.random()*10,1.8+Math.random()*2.5,color,opacity).setAngle(-12+Math.random()*24);
      else if(style==='mist')shape=this.scene.add.circle(0,0,1.6+Math.random()*2.2,color,opacity);
      else shape=this.scene.add.circle(0,0,style==='snow'?1+Math.random()*1.6:1.2+Math.random()*2.3,color,opacity);
      const flow:WorldParticleFlow=style==='ash'||style==='mist'?'rise':style==='dust'?'across':'fall';
      const speed=style==='dust'?24+Math.random()*20:style==='snow'?9+Math.random()*17:style==='mist'?5+Math.random()*10:style==='ash'?18+Math.random()*28:15+Math.random()*22;
      const drift=style==='dust'?(Math.random()-.5)*5:(Math.random()-.5)*(style==='leaves'?30:style==='snow'?13:18);
      const particle:WorldParticle={shape,flow,speed,drift,sway:1.1+Math.random()*2.3,spin:(Math.random()-.5)*(style==='leaves'?150:style==='dust'?34:0),phase,opacity,scale:.82+Math.random()*.32,style};
      shape.setDepth(4);
      this.worldParticles.push(particle);
      this.resetWorldParticle(particle,true);
    }
  }
  private resetWorldParticle(particle:WorldParticle,initial=false){
    const x=26+Math.random()*338;
    if(particle.flow==='across')particle.shape.setPosition(initial?-22+Math.random()*430:-18,60+Math.random()*650);
    else if(particle.flow==='rise')particle.shape.setPosition(x,initial?28+Math.random()*740:798);
    else particle.shape.setPosition(x,initial?18+Math.random()*760:12);
    particle.shape.setScale(particle.scale).setAlpha(particle.opacity).setVisible(true);
    if(particle.style==='leaves')particle.shape.setAngle(Math.random()*180);
  }
  private updateWorldParticles(dt:number,now:number){
    for(const particle of this.worldParticles){
      const wave=Math.sin(now*particle.sway+particle.phase);
      if(particle.flow==='fall'){
        particle.shape.y+=particle.speed*dt;
        particle.shape.x+=(particle.drift+wave*(particle.style==='leaves'?18:6))*dt;
        if(particle.shape.y>792) this.resetWorldParticle(particle);
      }else if(particle.flow==='rise'){
        particle.shape.y-=particle.speed*dt;
        particle.shape.x+=(particle.drift+wave*(particle.style==='mist'?8:11))*dt;
        if(particle.shape.y<8) this.resetWorldParticle(particle);
      }else{
        particle.shape.x+=particle.speed*dt;
        particle.shape.y+=(particle.drift+wave*3)*dt;
        if(particle.shape.x>408) this.resetWorldParticle(particle);
      }
      if(particle.flow!=='across'){
        if(particle.shape.x<12)particle.shape.x=382;
        if(particle.shape.x>382)particle.shape.x=12;
      }
      if(particle.style==='leaves'||particle.style==='dust')particle.shape.setAngle(particle.shape.angle+particle.spin*dt);
      const pulse=particle.style==='mist'?1+wave*.22:particle.style==='snow'?1+wave*.08:1+wave*.12;
      particle.shape.setScale(particle.scale*pulse).setAlpha(Math.max(.08,particle.opacity*(.72+Math.abs(wave)*.28)));
    }
  }
  effect:Effect=(kind,x,y,team)=>{
    if(kind==='bossDeath')AudioManager.play('boss_death','sfx');
    if(kind==='bossSpawn')AudioManager.play('boss_spawn','sfx');
    if(kind==='hit'&&team){
      const engagedRobots=this.model.units.filter(unit=>unit.active&&unit.state==='attack').length;
      BattleAudioSystem.trigger(engagedRobots);
    }
    if(kind==='shoot'){
      if(this.weaponIndex===0)AudioManager.play('pulse_shot','sfx');
      if(this.weaponIndex===1)AudioManager.play('rapid_shot','sfx');
      if(this.weaponIndex===2)AudioManager.play('plasma_shot','sfx');
      this.recoil=1;this.flashLife=.12;this.muzzleFlash.setPosition(x,y);
    }if(kind==='base')this.impact=1;
    if(kind==='gate'&&this.scene.time.now-this.gateAt<90)return;if(kind==='gate')this.gateAt=this.scene.time.now;
    const count=kind==='victory'?35:kind==='gate'?6:kind==='spawn'?1:3;let made=0;
    const shotColor=this.weaponIndex===2?0xe57aff:this.weaponIndex===1?0xffb65b:0x88efff;
    for(const f of this.fx)if(f.life<=0&&made<count){made++;f.duration=kind==='victory'?1.5:.3;f.life=f.duration;f.shape.setPosition(x+(Math.random()-.5)*24,y+(Math.random()-.5)*15).setRadius(kind==='gate'?4:3).setFillStyle(kind==='gate'?0x98ffff:kind==='shoot'||kind==='hit'&&team==='red'?shotColor:team==='red'?0xff8565:0xffe66b).setVisible(true).setAlpha(1)}
    if(this.sound&&this.scene.time.now-this.soundAt>120){this.soundAt=this.scene.time.now;AudioManager.play(kind,'sfx')}
  };
  update(dt:number){const now=this.model.time;
    this.updateWorldParticles(dt,now);
    const playerKind=(['basic','runner','tank'] as const)[this.model.loadout.unitIndex]||'basic',skin=this.model.loadout.skin||'default',enemySkin=this.model.config.world.key;
    for(let i=0;i<this.bots.length;i++){
      const u=this.model.units[i],sprite=this.bots[i],shadow=this.shadows[i],eliteGlow=this.eliteGlows[i];
      sprite.setVisible(u.active);shadow.setVisible(u.active);
      if(!u.active){this.botMotion.delete(u.id);eliteGlow.setVisible(false);continue}
      const visualKind=u.team==='blue'?playerKind:(u.kind as EnemyVisualKind);
      const baseSize=visualKind==='boss'?52:visualKind==='miniBoss'?43:visualKind==='tank'?35:visualKind==='runner'||visualKind==='fast'?30:27;
      const bossPulse=visualKind==='boss'?1+Math.sin(now*3.6+i)*.028:visualKind==='miniBoss'?1+Math.sin(now*3.9+i)*.018:1;
      const hitPulse=u.hit>0?1+Math.sin((.12-u.hit)*Math.PI*12)*.035:1;
      const hitJolt=u.hit>0?Math.sin(now*42+i)*.8:0;
      // Tank enemies are intentionally larger, while their new sprite uses a cleaner silhouette.
      const sizeBoost=u.team==='blue'&&visualKind==='tank'?1.44:u.team==='blue'&&visualKind==='runner'?1.38:u.team==='red'&&visualKind==='tank'?1.44:visualKind==='boss'||visualKind==='miniBoss'?2:1.2;
      const size=baseSize*sizeBoost*bossPulse*hitPulse;
      const aspect=visualKind==='runner'||visualKind==='fast'?1.42:visualKind==='tank'||visualKind==='boss'||visualKind==='miniBoss'?1.1:1.24;
      const walking=u.state==='run';
      let motion=this.botMotion.get(u.id);
      if(!motion){motion={x:u.x,y:u.y,phase:(u.id*1.73)%(Math.PI*2),heading:0};this.botMotion.set(u.id,motion)}
      const dx=u.x-motion.x,dy=u.y-motion.y;
      motion.x+=dx*Math.min(1,dt*18);motion.y+=dy*Math.min(1,dt*18);
      const lateralRatio=dx/(Math.abs(dy)+Math.abs(dx)+1e-3),targetHeading=Phaser.Math.Clamp(lateralRatio*.32,-.2,.2);
      motion.heading=Phaser.Math.Linear(motion.heading,targetHeading,Math.min(1,dt*10));
      motion.phase+=dt*(walking?(visualKind==='runner'||visualKind==='fast'?13:visualKind==='tank'||visualKind==='boss'?8:10):3.5);
      const stride=Math.sin(motion.phase),lift=Math.abs(Math.sin(motion.phase)),bob=walking?lift*(1.1+(visualKind==='boss'?1.2:.5)):Math.sin(now*4+i)*.35,sway=walking?stride*(visualKind==='runner'||visualKind==='fast'?1.7:1.15):0,walkScale=walking?1+Math.sin(motion.phase*2)*.025:1,walkHeight=walking?1-Math.sin(motion.phase*2)*.025:1;
      const playerArtKey=`bot-player-art-${skin}-${playerKind}-back`,enemyKey=u.team==='red'?(ENEMY_TEXTURE_KEYS[enemySkin]||ENEMY_TEXTURE_KEYS.green)[visualKind as EnemyVisualKind]:'';
      const texture=u.team==='blue'&&this.scene.textures.exists(playerArtKey)?playerArtKey:this.scene.textures.exists(enemyKey)?enemyKey:`bot-enemy-${enemySkin}-${visualKind}`;
      const motionTurn=motion.heading+(u.state==='attack'?Math.sin(now*19+i)*.08:walking?stride*.035:Math.sin(now*4+i)*.015);
      const visualX=motion.x+Math.sin(u.id*2.399)*2.8,visualY=motion.y+Math.cos(u.id*1.927)*1.5,depthLayer=Math.sin(u.id*4.17)*1.5;
      // Blue sprites are rear-facing and red sprites are front-facing, so both read in their travel direction.
      sprite.setTexture(texture).setFlipY(false).setAlpha(.99).setDisplaySize(size*walkScale,size*aspect*walkHeight).setPosition(visualX+sway+hitJolt,visualY+bob).setDepth(visualY+5+depthLayer).setRotation(motionTurn);
      if(u.hit>0)sprite.setTint(u.team==='red'&&visualKind==='boss'?0xffbd52:0xffd58a);else sprite.clearTint();
      shadow.setFillStyle(u.team==='red'?0x260d2a:0x062d54,u.team==='red'?.34:.28).setDisplaySize(size*(.82+(walking?Math.abs(stride)*.08:0)),6.5).setPosition(visualX+sway*.55,visualY+2.5).setDepth(visualY-1);
      // Bosses stay clean cutouts; the old circular glow read as an opaque background.
      eliteGlow.setVisible(false).setAlpha(0);
    }
    for(let i=0;i<this.shots.length;i++){const s=this.model.shots[i],shot=this.shots[i];shot.setVisible(s.active).setFlipY(false).setPosition(s.x,s.y).setDepth(s.y+7).setRotation(Math.atan2(s.vx||0,-(s.vy||-350))).setAlpha(s.active?.95:0)}
    this.recoil=Math.max(0,this.recoil-dt*7);this.impact=Math.max(0,this.impact-dt*6);
    this.weaponBase.setPosition(195,690).setRotation(0);
    this.weaponTurret.setPosition(200,720+this.recoil*3).setRotation(this.model.aimAngle);
    this.flashLife=Math.max(0,this.flashLife-dt);
    this.muzzleFlash.setVisible(this.flashLife>0).setScale(.65+this.flashLife*5).setAlpha(this.flashLife/.12);
    this.fortress.setX(195+Math.sin(now*60)*this.impact*2);
    for(const f of this.fx)if(f.life>0){f.life-=dt;f.shape.y-=dt*28;f.shape.setAlpha(Math.max(0,f.life/f.duration));if(f.life<=0)f.shape.setVisible(false)}
  }
}

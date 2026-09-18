import Phaser from 'phaser';
import { BattleModel, type BattleCheckpoint, type BattleOutcome, type BattleSnapshot } from '../battle/BattleModel';
import { BattleRenderer, queueBattleAssets } from '../battle/BattleRenderer';
import type { Booster, Loadout } from '../battle/config';
import { GameEventBus } from '../GameEventBus';
import { AnalyticsService } from '../../services/AnalyticsService';
import { getWorldByLevel } from '../worlds/WorldConfig';

export type ArenaOptions=Loadout & {battleId:string;sfx:boolean;checkpoint?:BattleCheckpoint;onEnd:(outcome:BattleOutcome,checkpoint?:BattleCheckpoint)=>void;onProgress:(snapshot:BattleSnapshot)=>void};
export class ArenaScene extends Phaser.Scene {
  private model!:BattleModel;private art!:BattleRenderer;private options!:ArenaOptions;
  private accumulator=0;private hudClock=0;private delivered=false;
  constructor(){super('mobo-arena')}
  init(options:ArenaOptions){this.options=options;this.accumulator=0;this.hudClock=0;this.delivered=false}
  preload(){
    queueBattleAssets(this,getWorldByLevel(this.options.level).key,this.options.unitIndex,this.options.weaponIndex,this.options.skin||'default');
  }
  create(){
    // Render the 390×780 battlefield at 2× canvas resolution on high-density phones.
    this.cameras.main.setZoom(2).centerOn(195,390);
    this.model=new BattleModel(this.options,this.options.battleId,(...event)=>this.art?.effect(...event),this.options.checkpoint);
    this.art=new BattleRenderer(this,this.model,this.options.sfx);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>this.model.moveCannon(p.worldX));
    this.input.on('pointermove',(p:Phaser.Input.Pointer)=>{if(p.isDown)this.model.moveCannon(p.worldX)});
    this.options.onProgress(this.model.snapshot());GameEventBus.emit('BATTLE_STARTED',{level:this.options.level});
    const world=getWorldByLevel(this.options.level);
    AnalyticsService.trackLevelStart({
      battleId:this.options.battleId,
      level:this.options.level,
      world:world.key,
      playerLevel:this.options.level,
      selectedUnit:`unit_${this.options.unitIndex}`,
      selectedWeapon:`weapon_${this.options.weaponIndex}`,
      unitLevel:this.options.unitLevel,
      weaponLevel:this.options.weaponLevel,
      challenge:Boolean(this.options.challenge),
    });
  }
  useBooster(type:Booster){if(!this.scene.isActive())return false;const used=this.model.useBooster(type);if(used){this.options.onProgress(this.model.snapshot());AnalyticsService.trackBoostUsed({type,level:this.options.level,world:getWorldByLevel(this.options.level).key})}return used}
  update(_:number,delta:number){
    this.accumulator+=Math.min(delta/1000,.1);
    while(this.accumulator>=1/30){this.model.update(1/30);this.accumulator-=1/30}
    this.art.update(Math.min(delta/1000,.1));this.hudClock+=delta;
    if(this.hudClock>=150){this.hudClock=0;this.options.onProgress(this.model.snapshot())}
    if(this.model.result&&!this.delivered){this.delivered=true;const outcome=this.model.result;const checkpoint=outcome.result==='defeat'?this.model.checkpoint():undefined;GameEventBus.emit(outcome.result==='victory'?'VICTORY':'DEFEAT',outcome);this.time.delayedCall(850,()=>this.options.onEnd(outcome,checkpoint))}
  }
}

import { FIELD } from './config';
import { GateRewardGenerator, type GateBonus } from './GateRewardGenerator';

export type PortalState='warning'|'open'|'selected'|'closing';
export type DynamicGate=GateBonus & {id:number;eventId:number;x:number;y:number;width:number;state:PortalState;bornAt:number;openAt:number;used:boolean;disabled:boolean};
export type PortalEvent={id:number;state:PortalState;bornAt:number;openAt:number;expiresAt:number;closeAt:number;selectedId:number|null;gates:[DynamicGate,DynamicGate]};
export type GateDirectorCheckpoint={active:PortalEvent|null;nextGateAllowedTime:number;sequence:number;nextEvaluation:number};
export type GateThreat={time:number;level:number;playerBotCount:number;enemyCountAlive:number;nearbyEnemyCount:number;upcomingEnemyCount:number;distanceToNextEnemyGroup:number;waveProgress:number;currentWave:number;enemyStrength:number;playerStrength:number;bossIncoming:boolean;frontY:number;nextEnemyY:number};

export const GATE_BALANCE={warningSeconds:.32,choiceSeconds:6,selectedSeconds:.52,cooldownMin:7,cooldownMax:12,minBattleSeconds:1.25,minArmyDistance:72,minEnemyDistance:82,minimumThreat:.8};

/** Decides when one pair of world-space portals earns a short tactical choice. */
export class GateDirector {
  active:PortalEvent|null=null;nextGateAllowedTime=GATE_BALANCE.minBattleSeconds;private sequence=0;private nextEvaluation=0;
  private readonly rewards:GateRewardGenerator;
  constructor(private random:()=>number){this.rewards=new GateRewardGenerator(random)}
  get gates():DynamicGate[]{return this.active?.gates||[]}
  update(input:GateThreat){
    const active=this.active;
    if(active){
      if(active.state==='warning'&&input.time>=active.openAt){active.state='open';for(const gate of active.gates)gate.state='open'}
      if((active.state==='warning'||active.state==='open')&&input.time>=active.expiresAt)this.close(input.time);
      if(active.state==='selected'||active.state==='closing'){
        if(input.time>=active.closeAt){this.active=null;this.nextGateAllowedTime=input.time+this.cooldown();}
      }
      return;
    }
    if(input.time<this.nextGateAllowedTime||input.time<this.nextEvaluation)return;
    this.nextEvaluation=input.time+1.15+this.random()*.65;
    const ratio=input.enemyStrength/Math.max(input.playerStrength,1);
    if(ratio<GATE_BALANCE.minimumThreat||input.distanceToNextEnemyGroup<145||input.distanceToNextEnemyGroup>430)return;
    if(input.frontY<=255||input.nextEnemyY<=0)return;
    const chance=input.bossIncoming?1:ratio>2.2?.95:ratio>1.4?.66:ratio>.8?.22:0;
    if(this.random()>chance)return;
    const y=Math.max(255,Math.min(590,input.frontY-Math.max(GATE_BALANCE.minArmyDistance,Math.min(155,input.distanceToNextEnemyGroup*.48))));
    if(input.frontY-y<GATE_BALANCE.minArmyDistance||y-input.nextEnemyY<GATE_BALANCE.minEnemyDistance)return;
    this.spawn(input,y,ratio);
  }
  select(gateId:number,time:number):DynamicGate|undefined{
    const active=this.active;if(!active)return;
    const selected=active.gates.find(gate=>gate.id===gateId);if(!selected)return;
    if(active.state==='selected')return active.selectedId===gateId?selected:undefined;
    if(active.state!=='open')return;
    active.state='selected';active.selectedId=gateId;active.closeAt=time+GATE_BALANCE.selectedSeconds;
    for(const gate of active.gates){gate.disabled=gate!==selected;gate.state=gate===selected?'selected':'closing'}
    selected.used=true;return selected;
  }
  close(time:number){
    const active=this.active;if(!active)return;
    active.state='closing';active.closeAt=time+.32;for(const gate of active.gates){gate.disabled=true;gate.state='closing'}
  }
  checkpoint():GateDirectorCheckpoint{
    return {active:this.active?{...this.active,gates:this.active.gates.map(gate=>({...gate})) as [DynamicGate,DynamicGate]}:null,nextGateAllowedTime:this.nextGateAllowedTime,sequence:this.sequence,nextEvaluation:this.nextEvaluation};
  }
  restore(checkpoint:GateDirectorCheckpoint){
    this.active=checkpoint.active?{...checkpoint.active,gates:checkpoint.active.gates.map(gate=>({...gate})) as [DynamicGate,DynamicGate]}:null;
    this.nextGateAllowedTime=checkpoint.nextGateAllowedTime;this.sequence=checkpoint.sequence;this.nextEvaluation=checkpoint.nextEvaluation;
  }
  private spawn(input:GateThreat,y:number,threatRatio:number){
    const id=++this.sequence;const [left,right]=this.rewards.generate({playerBotCount:input.playerBotCount,level:input.level,wave:input.currentWave,threatRatio,bossIncoming:input.bossIncoming});
    const make=(bonus:GateBonus,index:number):DynamicGate=>({
      ...bonus,id:id*10+index,eventId:id,x:index?287:103,y,width:106,state:'warning',bornAt:input.time,openAt:input.time+GATE_BALANCE.warningSeconds,used:false,disabled:false,
    });
    this.active={id,state:'warning',bornAt:input.time,openAt:input.time+GATE_BALANCE.warningSeconds,expiresAt:input.time+GATE_BALANCE.warningSeconds+GATE_BALANCE.choiceSeconds,closeAt:0,selectedId:null,gates:[make(left,0),make(right,1)]};
  }
  private cooldown(){return GATE_BALANCE.cooldownMin+this.random()*(GATE_BALANCE.cooldownMax-GATE_BALANCE.cooldownMin)}
}

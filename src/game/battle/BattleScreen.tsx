import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Phaser from 'phaser';
import { App as CapacitorApp } from '@capacitor/app';
import { ArenaScene, type ArenaOptions } from '../phaser/ArenaScene';
import type { BattleCheckpoint, BattleOutcome, BattleSnapshot } from './BattleModel';
import type { Loadout, Booster } from './config';
import './battle.css';
import { useBoosterInventory } from './BoosterInventoryStore';
import './booster-tutorial.css';
import './booster-battle-art.css';
import boosterRewardsArt from '../../assets/booster-rewards-art.webp';
import battleAimCrosshair from '../../assets/battle-aim-crosshair.png';
import { getWorldByLevel } from '../worlds/WorldConfig';
import { getPlayerSkinArt } from './PlayerSkinAssets';
import { CurrencyValue } from '../../ui/Currency';
import { BattleAudioSystem } from '../../services/BattleAudioSystem';
import { AnalyticsService } from '../../services/AnalyticsService';

type Props={loadout:Loadout;coins:number;sfx:boolean;checkpoint?:BattleCheckpoint;onEnd:(outcome:BattleOutcome,checkpoint?:BattleCheckpoint)=>void;onExit:()=>void;onRetry:()=>void};
let battleSequence=0;
function createBattleId(){
  const secureCrypto=globalThis.crypto;
  if(typeof secureCrypto?.randomUUID==='function')return secureCrypto.randomUUID();
  battleSequence+=1;
  return `mobo-battle-${Date.now().toString(36)}-${battleSequence}`;
}
export function BattleScreen({loadout,coins,sfx,checkpoint,onEnd,onExit,onRetry}:Props){
  const parent=useRef<HTMLDivElement>(null),gameRef=useRef<Phaser.Game|null>(null);
  const boosters=useBoosterInventory(state=>state.inventory);
  const bossLevel=loadout.level%10===0;
  const [snapshot,setSnapshot]=useState<BattleSnapshot|null>(null),[arenaReady,setArenaReady]=useState(false),[paused,setPaused]=useState(false),[error,setError]=useState(false),[aimPointer,setAimPointer]=useState<{x:number;y:number}|null>(null),[freezeHint,setFreezeHint]=useState(()=>loadout.level===1&&localStorage.getItem('mobo-freeze-tutorial-v1')!=='true'),[directionHint,setDirectionHint]=useState(()=>loadout.level===1&&localStorage.getItem('mobo-direction-tutorial-v1')!=='true'),[freezeNotice,setFreezeNotice]=useState(false);
  const callbacks=useRef({onEnd});callbacks.current={onEnd};
  useEffect(()=>{BattleAudioSystem.start();BattleAudioSystem.setEnabled(sfx);return()=>BattleAudioSystem.stop()},[]);
  useEffect(()=>{BattleAudioSystem.setEnabled(sfx)},[sfx]);
  const pause=(value:boolean)=>{const manager=gameRef.current?.scene;if(!manager?.isActive('mobo-arena')&&!manager?.isPaused('mobo-arena'))return;value?manager.pause('mobo-arena'):manager.resume('mobo-arena');setPaused(value)};
  const pauseRef=useRef<(value:boolean)=>void>(()=>{});
  pauseRef.current=pause;
  useEffect(()=>{const handleNativeBack=()=>pauseRef.current(true);window.addEventListener('mobo-war-battle-back',handleNativeBack);return()=>window.removeEventListener('mobo-war-battle-back',handleNativeBack)},[]);
  useEffect(()=>{
    let disposed=false;
    try{
      const options:ArenaOptions={...loadout,boosters,battleId:createBattleId(),sfx,checkpoint,onEnd:(r,saved)=>{if(!disposed)callbacks.current.onEnd(r,saved)},onProgress:s=>{if(!disposed){setSnapshot(s);setArenaReady(true)}}};
      const scene=new ArenaScene();
      const game=new Phaser.Game({type:Phaser.AUTO,parent:parent.current!,width:780,height:1560,backgroundColor:'#49c5d1',antialias:true,render:{roundPixels:false},scale:{mode:Phaser.Scale.ENVELOP,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[],audio:{noAudio:true}});
      gameRef.current=game;
      game.scene.add('mobo-arena',scene,true,options);
    }catch(error){
      AnalyticsService.reportError(error,{source:'battle_initialization',level:loadout.level});
      setError(true);
    }
    const hide=()=>{if(document.hidden)pause(true)};document.addEventListener('visibilitychange',hide);
    let mounted=true;let appStateListener:{remove:()=>Promise<void>}|undefined;
    void CapacitorApp.addListener('appStateChange',({isActive})=>pause(!isActive)).then((registered)=>{if(mounted)appStateListener=registered;else void registered.remove()}).catch(()=>{});
    return()=>{mounted=false;disposed=true;document.removeEventListener('visibilitychange',hide);void appStateListener?.remove();gameRef.current?.destroy(true);gameRef.current=null};
  },[]);
  const boost=(type:Booster)=>{if(paused||!snapshot?.boosters[type])return;const scene=gameRef.current?.scene.getScene('mobo-arena') as ArenaScene|undefined;if(scene?.useBooster(type)){useBoosterInventory.getState().spend(type);if(type==='freeze'&&freezeHint){localStorage.setItem('mobo-freeze-tutorial-v1','true');setFreezeHint(false);setFreezeNotice(true);window.setTimeout(()=>setFreezeNotice(false),1800)}}};
  const updateAimPointer=(event:ReactPointerEvent<HTMLDivElement>)=>{const rect=event.currentTarget.getBoundingClientRect();setAimPointer({x:event.clientX-rect.left,y:event.clientY-rect.top})};
  const hideAimPointer=()=>setAimPointer(null);
  const world=getWorldByLevel(loadout.level);
  return <section className={`war-screen battle-world-${world.key} ${arenaReady?'arena-ready':''}`} aria-label="Battlefield"><div className="war-viewport" onPointerEnter={updateAimPointer} onPointerMove={updateAimPointer} onPointerDown={updateAimPointer} onPointerUp={hideAimPointer} onPointerCancel={hideAimPointer} onPointerLeave={hideAimPointer}><div className="war-canvas" ref={parent}/>{aimPointer&&arenaReady&&!paused&&!error&&<img className="battle-aim-pointer" src={battleAimCrosshair} alt="" aria-hidden="true" style={{left:aimPointer.x,top:aimPointer.y}}/>}{!arenaReady&&<div className="battle-loading-cover" aria-label="Preparing battlefield"><main><span>MISSION DEPLOYMENT</span><div className="battle-loading-unit"><img src={getPlayerSkinArt((['basic','runner','tank'] as const)[loadout.unitIndex]||'basic',loadout.skin||'default','back')} alt=""/></div><h1>{world.name}</h1><p>Preparing your squad for Level {loadout.level}</p><div className="battle-loading-bar"><i/></div><b>DEPLOYING BATTLEFIELD</b></main><aside><strong>COMMANDER TIP</strong><span>Your cannon fires automatically</span><small>Swipe left or right to guide your army into position.</small></aside></div>}
    {arenaReady&&<><header className={`war-hud ${bossLevel?'boss-hud':''}`}><div className="war-top"><button aria-label="Pause battle" onClick={()=>pause(true)}>Ⅱ</button><div><strong>Level {loadout.level}</strong></div><CurrencyValue kind="coin" value={coins.toLocaleString()} className="war-coins"/></div>
    <div className="war-progress" role="progressbar" aria-label="Enemy fortress HP" aria-valuenow={Math.round((snapshot?.progress||0)*100)} aria-valuemin={0} aria-valuemax={100}><i style={{width:`${(snapshot?.progress||0)*100}%`}}/></div></header>
    <div className="war-booster-rail"><div className="war-boosters">{(['freeze','army','blast'] as const).map((type,i)=><button key={type} disabled={paused||!snapshot?.boosters[type]} aria-label={`${type} booster`} onClick={()=>boost(type)}><span className={`war-booster-art booster-art-${type}`} style={{backgroundImage:`url(${boosterRewardsArt})`}} aria-hidden="true"/><small>{['FREEZE','+7 BOTS','BLAST'][i]}</small><b>{snapshot?.boosters[type]??0}</b></button>)}</div>{freezeHint&&<div className="booster-tutorial"><b>FREEZE BOOST</b><span>Tap Freeze to stop enemies for 2 seconds</span><i>›</i></div>}</div>
    {directionHint&&<div className="battle-command-tutorial"><strong>COMMAND YOUR ARMY</strong><span>Swipe left or right to guide your bots</span><small>Your cannon aims and fires automatically</small><button onClick={()=>{localStorage.setItem('mobo-direction-tutorial-v1','true');setDirectionHint(false)}}>GOT IT</button></div>}{freezeNotice&&<div className="booster-effect-toast">❄ ENEMIES FROZEN!</div>}
    <div className="war-timer">{bossLevel?'⚔ BOSS WAVE':'WAVE'} {bossLevel?'':`${snapshot?.wave||1}/3 · `}{Math.max(0,110-(snapshot?.time||0))}s</div>
    {(paused||error)&&<div className="war-overlay"><div className={`war-dialog ${error?'error-dialog':'pause-dialog'}`}><h2>{error?'Battle unavailable':'PAUSED'}</h2><div className="war-dialog-rule" aria-hidden="true"><i/><span/><i/></div><p>{error?'Please retry loading the battlefield.':'Your army is waiting for your command.'}</p>{!error&&<div className="war-dialog-status"><i/><span>BATTLEFIELD SECURED</span><i/></div>}<div className="war-dialog-actions">{!error&&<button className="war-primary" onClick={()=>pause(false)}>RESUME BATTLE</button>}<button onClick={onRetry}>RETRY LEVEL</button><button onClick={onExit}>BACK TO LOBBY</button></div></div></div>}</>}
  </div></section>;
}

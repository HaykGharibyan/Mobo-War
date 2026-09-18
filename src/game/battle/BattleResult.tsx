import { useRef, useState, type CSSProperties } from 'react';
import type { BattleReceipt } from './settlement';
import { AdController } from '../../services/AdController';
import { getWorldByLevel, WORLDS } from '../worlds/WorldConfig';
import { getWorldIslandAsset } from '../worlds/WorldVisualAssets';
import { BoosterChoice } from './BoosterChoice';
import type { BoosterCard } from './BoosterRewards';
import './battle.css';
import './booster-modal.css';
import victoryReference from '../../assets/victory-screen-bg-v2.webp';
import defeatReference from '../../assets/defeat-screen-bg.webp';
import { CurrencyIcon, CurrencyValue } from '../../ui/Currency';
type Props={receipt:BattleReceipt|null;onHome:()=>void;onNext:()=>void;onDouble:()=>void;onRevive?:()=>void;onBoosterChoice?:(card:BoosterCard)=>void};
export function BattleResult({receipt,onHome,onNext,onDouble,onRevive,onBoosterChoice}:Props){
  const [busy,setBusy]=useState(false),[boosted,setBoosted]=useState(receipt?.boosted||false),[message,setMessage]=useState(''),[boosterChosen,setBoosterChosen]=useState(false);const pending=useRef(false);
  if(!receipt)return <div className="war-result"><h1>No battle result</h1><button onClick={onHome}>HOME</button></div>;
  const victory=receipt.result==='victory';const challenge=!!receipt.challenge;const showBoosterChoice=victory&&!challenge;const canAct=!showBoosterChoice||boosterChosen;const worldComplete=victory&&!challenge&&receipt.level%10===0;const currentWorld=getWorldByLevel(receipt.level);const nextWorld=WORLDS.find(world=>world.id===currentWorld.id+1);
  const chooseBooster=(card:BoosterCard)=>{setBoosterChosen(true);if(card!=='empty')onBoosterChoice?.(card)};
  const double=async()=>{if(pending.current||boosted||!canAct)return;pending.current=true;setBusy(true);try{if(await AdController.showRewarded('double-reward')){onDouble();setBoosted(true)}else setMessage('Reward unavailable. Try again later.')}catch{setMessage('Reward unavailable. Your victory is saved.')}finally{pending.current=false;setBusy(false)}};
  const revive=async()=>{if(pending.current||!onRevive)return;pending.current=true;setBusy(true);setMessage('');try{if(await AdController.showRewarded('revive'))onRevive();else setMessage('Ad unavailable. Try again later.')}catch{setMessage('Ad unavailable. Your battle is saved.')}finally{pending.current=false;setBusy(false)}};
  const unlockedWorld=nextWorld||currentWorld;
  const unlockStyle={'--unlock-accent':unlockedWorld.mapTheme.accent,'--unlock-glow':unlockedWorld.mapTheme.glow} as CSSProperties;
  const resultStyle:CSSProperties&{'--victory-art'?:string;'--defeat-art'?:string}=victory
    ?{'--victory-art':`url(${victoryReference})`}
    :{'--defeat-art':`url(${defeatReference})`};
  return <div className={`war-result ${victory?'won':'lost'} ${challenge?'challenge-result ':''}${showBoosterChoice&&!boosterChosen?' has-booster-choice booster-pick-open ':''}${worldComplete?(nextWorld?'chapter-transition':'campaign-finale'):''}`} style={resultStyle}>
    {victory&&<div className="victory-art" aria-hidden="true"/>}
    {!victory&&<div className="defeat-art" aria-hidden="true"/>}
    {victory?<div className="victory-bottom">
      <div className="victory-copy"><h1>VICTORY!</h1><p>{worldComplete?`${currentWorld.name} conquered!`:`Level ${receipt.level} Completed!`}</p><div className="victory-earned"><CurrencyValue kind="coin" value={`+${receipt.coins*(boosted?2:1)}`}/><CurrencyValue kind="gem" value={`+${receipt.gems}`}/></div><small className="result-rewards-label">{receipt.replay?`REPLAY REWARD · ${Math.round(receipt.replayRate*100)}% COINS`:'REWARDS'}</small></div>
      {worldComplete&&<div className={`world-unlock unlock-${unlockedWorld.key}`} style={unlockStyle}><img src={getWorldIslandAsset(unlockedWorld)} alt=""/><div><small>{nextWorld?'NEW WORLD UNLOCKED':'CAMPAIGN COMPLETE'}</small>{nextWorld?<><strong>{nextWorld.name}</strong><span>Levels {nextWorld.levelStart}–{nextWorld.levelEnd}</span></>:<><strong>All Worlds Conquered</strong><span>The Mobo War campaign is complete</span></>}</div></div>}
      <div className="war-result-buttons"><button className="double-reward" disabled={busy||boosted||!canAct} onClick={double}><strong>{boosted?'✓ REWARD CLAIMED':busy?'LOADING…':'×2 REWARD'}</strong><small>{boosted?<><CurrencyIcon kind="coin" size={16}/>{receipt.coins*2} RECEIVED</>:busy?'PLEASE WAIT':<>▶ WATCH AD · <CurrencyIcon kind="coin" size={16}/>{receipt.coins} → {receipt.coins*2}</>}</small></button>{!challenge&&<button className="war-primary" disabled={busy||!canAct} onClick={onNext}>{worldComplete?(nextWorld?'NEXT LEVEL':'RETURN TO CAMPAIGN'):'NEXT LEVEL'}</button>}<button className="home-result" disabled={busy||!canAct} onClick={onHome}>⌂ <span>HOME</span></button></div><small role="status">{message}</small>
    </div>:<div className="defeat-bottom"><div className="defeat-copy"><p>Level {receipt.level} Failed!</p><div className="defeat-earned"><CurrencyValue kind="coin" value={`+${receipt.coins}`}/><CurrencyValue kind="gem" value={`+${receipt.gems}`}/></div><small className="result-rewards-label">REWARDS</small></div><button className="defeat-callout" disabled={busy||!onRevive} onClick={revive}><strong>{busy?'LOADING…':'TRY AGAIN'}</strong><small>▶ WATCH AD · CONTINUE</small></button><div className="war-result-buttons"><button className="war-primary" disabled={busy} onClick={onNext}>RETRY</button><button className="home-result" disabled={busy} onClick={onHome}>⌂ <span>HOME</span></button></div><small role="status">{message}</small></div>}
    {showBoosterChoice&&!boosterChosen&&<div className="booster-choice-modal" role="dialog" aria-modal="true" aria-label="Choose your reward"><BoosterChoice onChoose={chooseBooster}/></div>}
  </div>;
}

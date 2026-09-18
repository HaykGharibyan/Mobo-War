import { useState } from 'react';
import { boosterCardLabel, rollBoosterCards, settleBoosterCard, type BoosterCard } from './BoosterRewards';
import rewardFreezeArt from '../../assets/reward-card-freeze.webp';
import rewardArmyArt from '../../assets/reward-card-army.webp';
import rewardBlastArt from '../../assets/reward-card-blast.webp';
import rewardEmptyArt from '../../assets/reward-card-empty.webp';
import './booster-choice-base.css';
import './booster-choice.css';
import './booster-card-art.css';

type Props={onChoose:(card:BoosterCard)=>void};
const cardArt:Record<BoosterCard,string>={freeze:rewardFreezeArt,army:rewardArmyArt,blast:rewardBlastArt,empty:rewardEmptyArt};
export function BoosterChoice({onChoose}:Props){
  const [cards]=useState<BoosterCard[]>(rollBoosterCards);
  const [selected,setSelected]=useState<number|null>(null);
  const choose=(index:number)=>{
    if(selected!==null)return;
    const card=cards[index];
    setSelected(index);
    settleBoosterCard(card);
    // Keep the modal open long enough for the player to see the revealed reward.
    window.setTimeout(()=>onChoose(card),1800);
  };
  return <section className="booster-choice" aria-label="Booster reward">
    <div className="booster-choice-heading"><span>LUCKY REWARD</span><b>CHOOSE ONE CARD</b><small>One bonus · or try your luck next victory</small></div>
    <div className="booster-cards">{cards.map((card,index)=>{const revealed=selected===index;return <button type="button" key={index} className={`booster-card ${revealed?'revealed reward-'+card:''} ${selected!==null&&!revealed?'not-picked':''}`} onClick={()=>choose(index)} aria-label={`Reward card ${index+1}`}>
      <span className="booster-card-shine" aria-hidden="true"/>
      <img className={`booster-card-art ${revealed?'revealed-art':'card-back-art'} art-${revealed?card:'empty'}`} src={revealed?cardArt[card]:rewardEmptyArt} alt="" aria-hidden="true"/>
      <b>{revealed?boosterCardLabel(card):'LUCKY'}</b>
      <small>{revealed?(card==='empty'?'NO BONUS':'RECEIVED · SAVED'):'TAP TO REVEAL'}</small>
    </button>})}</div>
  </section>;
}

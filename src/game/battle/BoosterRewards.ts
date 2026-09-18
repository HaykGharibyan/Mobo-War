import type { Booster } from './config';

export type BoosterCard=Booster|'empty';
const STREAK_KEY='mobo-booster-empty-streak-v1';
// The empty reward is intentionally a little more common, while every table
// still totals 100 so the roll remains a real probability distribution.
const BASE_WEIGHTS:Array<[BoosterCard,number]>=[['empty',80],['freeze',9],['army',7],['blast',4]];
const PITY_WEIGHTS:Array<[BoosterCard,number]>=[['empty',40],['freeze',30],['army',17],['blast',13]];

function emptyStreak(){return Math.max(0,Math.floor(Number(localStorage.getItem(STREAK_KEY)||0)))}
function saveEmptyStreak(value:number){localStorage.setItem(STREAK_KEY,String(value))}
function roll(weights:Array<[BoosterCard,number]>):BoosterCard{
  let point=Math.random()*100;
  for(const [card,weight] of weights){point-=weight;if(point<0)return card}
  return 'empty';
}
export function rollBoosterCards():BoosterCard[]{
  const weights=emptyStreak()>=2?PITY_WEIGHTS:BASE_WEIGHTS;
  return [roll(weights),roll(weights),roll(weights)];
}
export function settleBoosterCard(card:BoosterCard){
  const next=card==='empty'?emptyStreak()+1:0;
  saveEmptyStreak(next);
}
export function boosterCardLabel(card:BoosterCard){return card==='freeze'?'FREEZE':card==='army'?'+7 BOTS':card==='blast'?'BLAST':'EMPTY';}
export function boosterCardIcon(card:BoosterCard){return card==='freeze'?'❄':card==='army'?'✚':card==='blast'?'✹':'—';}

import { campaignAfterVictory, rewardFor, type BattleReceipt } from './settlement';
import type { BattleOutcome } from './BattleModel';
export type Progress={coins:number;gems:number;level:number;wins:number};
export type Journal={version:1;progress:Progress;receipts:BattleReceipt[]};
export const PROGRESS_KEY='mobo-battle-progress-v1';
export function settle(journal:Journal,outcome:BattleOutcome):Journal{
  if(journal.receipts.some(r=>r.id===outcome.id))return journal;
  const p=journal.progress,replayCount=outcome.result==='victory'&&outcome.level<p.level?journal.receipts.filter(r=>r.result==='victory'&&r.level===outcome.level).length:0,receipt=rewardFor(outcome,replayCount);
  return {version:1,progress:{coins:p.coins+receipt.coins+(receipt.chapterReward?.coins||0),gems:p.gems+receipt.gems+(receipt.chapterReward?.gems||0),level:outcome.challenge?p.level:outcome.result==='victory'?campaignAfterVictory(p.level,outcome.level):p.level,wins:p.wins+(outcome.result==='victory'&&!outcome.challenge?1:0)},receipts:[...journal.receipts.slice(-127),receipt]};
}
export function doubleCoins(journal:Journal,id:string):Journal{
  const receipt=journal.receipts.find(r=>r.id===id);if(!receipt||receipt.boosted||receipt.result!=='victory')return journal;
  return {...journal,progress:{...journal.progress,coins:journal.progress.coins+receipt.coins},receipts:journal.receipts.map(r=>r.id===id?{...r,boosted:true}:r)};
}
export function readJournal(fallback:Progress):Journal{
  try{const data=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'null');if(data?.version===1&&Array.isArray(data.receipts)&&Object.values(data.progress).every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0)&&data.progress.level>=1)return data}catch{}
  return {version:1,progress:fallback,receipts:[]};
}

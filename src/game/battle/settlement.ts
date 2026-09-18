import type { BattleOutcome } from './BattleModel';
import { RewardsService } from '../../services/RewardsService';
import { ECONOMY } from '../config/economy';
export type ChapterReward={coins:number;gems:number};
export type BattleReceipt=BattleOutcome & {coins:number;gems:number;boosted:boolean;replay:boolean;replayRate:number;chapterReward?:ChapterReward};
export function selectedBattleLevel(unlocked:number){const n=Number(sessionStorage.getItem('mobo-selected-level'));return Number.isInteger(n)&&n>=1&&n<=unlocked?n:unlocked}
const WIN_COIN_MULTIPLIER=.95;
export function rewardFor(outcome:BattleOutcome,replayCount=0):BattleReceipt{const victory=outcome.result==='victory',worldComplete=victory&&outcome.level%10===0,baseGems=victory?RewardsService.battleGems(outcome.level):0,replay=replayCount>0,replayRate=replay?Math.max(.1,.8-replayCount*.1):1,coins=victory?Math.round(RewardsService.battleCoins(outcome.level,outcome.stars)*WIN_COIN_MULTIPLIER*replayRate):0,chapterReward=worldComplete?{coins:Math.round((700+outcome.level*18)*WIN_COIN_MULTIPLIER*replayRate),gems:25+Math.floor(outcome.level/10)*5}:undefined;return {...outcome,coins,gems:outcome.challenge?baseGems*2:baseGems,boosted:false,replay,replayRate,chapterReward}}
export function campaignAfterVictory(unlocked:number,played:number){return played===unlocked?Math.min(ECONOMY.maxCampaignLevel,unlocked+1):unlocked}

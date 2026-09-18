import { create } from 'zustand';

export type PassTrack='free'|'premium';
type State={claimedFree:number[];claimedPremium:number[];premiumUnlocked:boolean;claim:(track:PassTrack,tier:number)=>boolean;unlockPremium:()=>void};
const STORAGE_KEY='mobo-battle-pass-v2';
function read(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(saved?.season==='season-1'&&Array.isArray(saved.claimedFree)&&Array.isArray(saved.claimedPremium))return {claimedFree:saved.claimedFree.filter((tier:number)=>Number.isInteger(tier)&&tier>=1&&tier<=50),claimedPremium:saved.claimedPremium.filter((tier:number)=>Number.isInteger(tier)&&tier>=1&&tier<=50)};const legacy=JSON.parse(localStorage.getItem('mobo-pass-claimed')||'[]');if(Array.isArray(legacy))return {claimedFree:legacy.filter((tier:number)=>Number.isInteger(tier)&&tier>=0&&tier<50).map((tier:number)=>tier+1),claimedPremium:[]}}catch{}return {claimedFree:[],claimedPremium:[]}}
const initial=read();
const premiumUnlocked=localStorage.getItem('mobo-premium-pass-v1')==='true';
export const useBattlePass=create<State>((set,get)=>({claimedFree:initial.claimedFree,claimedPremium:initial.claimedPremium,premiumUnlocked,claim:(track,tier)=>{if(!Number.isInteger(tier)||tier<1||tier>50)return false;const claimed=track==='free'?get().claimedFree:get().claimedPremium;if(claimed.includes(tier))return false;const next=[...claimed,tier].sort((a,b)=>a-b);const state=track==='free'?{claimedFree:next}:{claimedPremium:next};set(state);localStorage.setItem(STORAGE_KEY,JSON.stringify({season:'season-1',claimedFree:track==='free'?next:get().claimedFree,claimedPremium:track==='premium'?next:get().claimedPremium}));return true},unlockPremium:()=>{localStorage.setItem('mobo-premium-pass-v1','true');set({premiumUnlocked:true})}}));

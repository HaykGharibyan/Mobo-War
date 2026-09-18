import { create } from 'zustand';

export type SkinId='default'|'ninja'|'knight'|'cyber'|'golden'|'blackgold';
type State={owned:SkinId[];grant:(skin:SkinId)=>void;has:(skin:SkinId)=>boolean};
const STORAGE_KEY='mobo-skin-inventory-v1';
const VALID:SkinId[]=['default','ninja','knight','cyber','golden','blackgold'];
function read():SkinId[]{try{const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(Array.isArray(value))return ['default',...value.filter((skin:SkinId)=>VALID.includes(skin)&&skin!=='default')].filter((skin,index,array)=>array.indexOf(skin)===index)}catch{}return ['default']}
const initial=read();
export const useSkinInventory=create<State>((set,get)=>({owned:initial,grant:(skin)=>{if(!VALID.includes(skin)||get().owned.includes(skin))return;const owned=[...get().owned,skin];set({owned});localStorage.setItem(STORAGE_KEY,JSON.stringify(owned))},has:(skin)=>get().owned.includes(skin)}));

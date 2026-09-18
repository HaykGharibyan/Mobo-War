import { create } from 'zustand';
import type { Booster } from './config';

export type BoosterInventory=Record<Booster,number>;
const STORAGE_KEY='mobo-booster-inventory-v1';
const DEFAULT_INVENTORY:BoosterInventory={freeze:2,army:1,blast:1};

function readInventory():BoosterInventory{
  try{
    const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
    if(value&&typeof value==='object')return {freeze:Math.max(0,Math.floor(Number(value.freeze)||0)),army:Math.max(0,Math.floor(Number(value.army)||0)),blast:Math.max(0,Math.floor(Number(value.blast)||0))};
  }catch{}
  return {...DEFAULT_INVENTORY};
}
function saveInventory(inventory:BoosterInventory){localStorage.setItem(STORAGE_KEY,JSON.stringify(inventory))}

type BoosterInventoryState={inventory:BoosterInventory;spend:(type:Booster)=>boolean;grant:(type:Booster,amount?:number)=>void};
export const useBoosterInventory=create<BoosterInventoryState>((set,get)=>({
  inventory:readInventory(),
  spend:(type)=>{
    const current=get().inventory[type];
    if(current<=0)return false;
    const inventory={...get().inventory,[type]:current-1};
    saveInventory(inventory);set({inventory});return true;
  },
  grant:(type,amount=1)=>{
    if(amount<=0)return;
    const inventory={...get().inventory,[type]:get().inventory[type]+Math.floor(amount)};
    saveInventory(inventory);set({inventory});
  },
}));

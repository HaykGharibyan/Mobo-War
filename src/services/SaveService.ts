export type SaveData={saveVersion:1;coins:number;gems:number;level:number;equippedUnit:string;equippedWeapon:string;settings:{music:boolean;sfx:boolean;vibration:boolean}};
const KEY='mobo-war-save-v1';
export const SaveService={load():SaveData|null{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}},save(data:SaveData){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{console.warn('Save unavailable')}},clear(){localStorage.removeItem(KEY)}};

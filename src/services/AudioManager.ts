import lobbyThemeUrl from '../assets/lobby-theme.mp3';
import battleThemeUrl from '../assets/battle-theme.mp3';
import bossThemeUrl from '../assets/boss-theme.mp3';
import defeatSoundUrl from '../assets/defeat-sound.mp3';
import victorySoundUrl from '../assets/victory-sound.mp3';
import uiClickSoundUrl from '../assets/ui-click.mp3';
import bossDeathSoundUrl from '../assets/boss-death-impact.mp3';
import bossSpawnSoundUrl from '../assets/boss-spawn-bass.mp3';
import plasmaImpactSoundUrl from '../assets/plasma-impact.mp3';
import rapidImpactSoundUrl from '../assets/rapid-impact.mp3';
import pulseImpactSoundUrl from '../assets/pulse-impact.mp3';
import { BattleAudioSystem } from './BattleAudioSystem';

export type AudioCategory='music'|'sfx'|'ui';
export interface AudioProvider{play(id:string,category:AudioCategory):void;setEnabled(category:AudioCategory,enabled:boolean):void;stop(category:AudioCategory):void;pause():void;resume():void;unlock():void}

let lobbyMusic:HTMLAudioElement|null=null;
let battleMusic:HTMLAudioElement|null=null;
let bossMusic:HTMLAudioElement|null=null;
let defeatSound:HTMLAudioElement|null=null;
let victorySound:HTMLAudioElement|null=null;
let uiClickSound:HTMLAudioElement|null=null;
let bossDeathSound:HTMLAudioElement|null=null;
let bossSpawnSound:HTMLAudioElement|null=null;
let plasmaImpactSound:HTMLAudioElement|null=null;
let rapidImpactSound:HTMLAudioElement|null=null;
let pulseImpactSound:HTMLAudioElement|null=null;
let battleFadeTimer:ReturnType<typeof setInterval>|null=null;
let bossFadeTimer:ReturnType<typeof setInterval>|null=null;
const readAudioPreference=(key:'music'|'sfx')=>{
  try{return localStorage.getItem(`mobo-${key}`)!=='false'}catch{return true}
};
let musicEnabled=readAudioPreference('music');
let sfxEnabled=readAudioPreference('sfx');
let activeMusicId:string|null=null;
let musicWatchdog:ReturnType<typeof setInterval>|null=null;

function switchMusic(id:string,track:HTMLAudioElement){
  if(activeMusicId!==id){
    if(lobbyMusic&&id!=='lobby_theme')lobbyMusic.pause();
    if(battleMusic&&id!=='battle_theme'){battleMusic.pause();battleMusic.currentTime=0;battleMusic.volume=.1;}
    if(bossMusic&&id!=='boss_theme'){bossMusic.pause();bossMusic.currentTime=0;bossMusic.volume=.1;}
    activeMusicId=id;
  }
  if(track.paused)void track.play().catch(()=>undefined);
  if(musicWatchdog)clearInterval(musicWatchdog);
  musicWatchdog=setInterval(()=>{if(activeMusicId===id&&musicEnabled&&track.paused)void track.play().catch(()=>undefined)},900);
}

function protectMusic(id:string,track:HTMLAudioElement){
  track.onpause=()=>{if(activeMusicId===id&&musicEnabled&&document.visibilityState==='visible')window.setTimeout(()=>{if(activeMusicId===id&&musicEnabled&&track.paused)void track.play().catch(()=>undefined)},80)};
  track.onended=()=>{if(activeMusicId===id&&musicEnabled)void track.play().catch(()=>undefined)};
}

function fadeInMusic(track:HTMLAudioElement,kind:'battle'|'boss'){
  const previousTimer=kind==='battle'?battleFadeTimer:bossFadeTimer;
  if(previousTimer)clearInterval(previousTimer);
  track.volume=0.1;
  const targetVolume=0.7;
  const steps=35;
  let step=0;
  const timer=setInterval(()=>{
    step+=1;
    track.volume=Math.min(targetVolume,0.1+((targetVolume-0.1)*step)/steps);
    if(step>=steps){
      clearInterval(timer);
      if(kind==='battle')battleFadeTimer=null;
      else bossFadeTimer=null;
    }
  },100);
  if(kind==='battle')battleFadeTimer=timer;
  else bossFadeTimer=timer;
}

function getLobbyMusic(){
  if(!lobbyMusic){
    lobbyMusic=new Audio(lobbyThemeUrl);
    lobbyMusic.loop=true;
    lobbyMusic.preload='auto';
    lobbyMusic.volume=0.42;
    protectMusic('lobby_theme',lobbyMusic);
  }
  return lobbyMusic;
}
function getBattleMusic(){
  if(!battleMusic){
    battleMusic=new Audio(battleThemeUrl);
    battleMusic.loop=true;
    battleMusic.preload='auto';
    battleMusic.volume=0.48;
    protectMusic('battle_theme',battleMusic);
  }
  return battleMusic;
}
function getBossMusic(){
  if(!bossMusic){
    bossMusic=new Audio(bossThemeUrl);
    bossMusic.loop=true;
    bossMusic.preload='auto';
    bossMusic.volume=0.52;
    protectMusic('boss_theme',bossMusic);
  }
  return bossMusic;
}
function getDefeatSound(){
  if(!defeatSound){
    defeatSound=new Audio(defeatSoundUrl);
    defeatSound.preload='auto';
    defeatSound.volume=0.72;
  }
  return defeatSound;
}
function getVictorySound(){
  if(!victorySound){
    victorySound=new Audio(victorySoundUrl);
    victorySound.preload='auto';
    victorySound.volume=0.78;
  }
  return victorySound;
}
function getUiClickSound(){
  if(!uiClickSound){
    uiClickSound=new Audio(uiClickSoundUrl);
    uiClickSound.preload='auto';
    uiClickSound.volume=0.25;
  }
  return uiClickSound;
}
function getBossDeathSound(){
  if(!bossDeathSound){
    bossDeathSound=new Audio(bossDeathSoundUrl);
    bossDeathSound.preload='auto';
    bossDeathSound.volume=.82;
  }
  return bossDeathSound;
}
function getBossSpawnSound(){
  if(!bossSpawnSound){
    bossSpawnSound=new Audio(bossSpawnSoundUrl);
    bossSpawnSound.preload='auto';
    bossSpawnSound.volume=.72;
  }
  return bossSpawnSound;
}
function getPlasmaImpactSound(){
  if(!plasmaImpactSound){
    plasmaImpactSound=new Audio(plasmaImpactSoundUrl);
    plasmaImpactSound.preload='auto';
    plasmaImpactSound.volume=.18;
  }
  return plasmaImpactSound;
}
function getRapidImpactSound(){
  if(!rapidImpactSound){
    rapidImpactSound=new Audio(rapidImpactSoundUrl);
    rapidImpactSound.preload='auto';
    rapidImpactSound.volume=.18;
  }
  return rapidImpactSound;
}
function getPulseImpactSound(){
  if(!pulseImpactSound){
    pulseImpactSound=new Audio(pulseImpactSoundUrl);
    pulseImpactSound.preload='auto';
    pulseImpactSound.volume=.18;
  }
  return pulseImpactSound;
}

function stopSfxTracks(){
  BattleAudioSystem.stopVoices();
  [defeatSound,victorySound,bossDeathSound,bossSpawnSound,plasmaImpactSound,rapidImpactSound,pulseImpactSound,uiClickSound].forEach(track=>{
    if(track){track.pause();track.currentTime=0}
  });
}

export const AudioManager:AudioProvider={
  play(id,category){
    if(category==='music'&&id==='lobby_theme'&&musicEnabled){
      const track=getLobbyMusic();
      switchMusic(id,track);
      return;
    }
    if(category==='music'&&id==='battle_theme'&&musicEnabled){
      const track=getBattleMusic();
      switchMusic(id,track);
      if(track.paused){
        fadeInMusic(track,'battle');
        void track.play().catch(()=>undefined);
      }
      return;
    }
    if(category==='music'&&id==='boss_theme'&&musicEnabled){
      const track=getBossMusic();
      switchMusic(id,track);
      if(track.paused){
        fadeInMusic(track,'boss');
        void track.play().catch(()=>undefined);
      }
      return;
    }
    if(category==='sfx'&&id==='defeat'&&sfxEnabled){
      const sound=getDefeatSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='victory'&&sfxEnabled){
      const sound=getVictorySound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='boss_death'&&sfxEnabled){
      const sound=getBossDeathSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='boss_spawn'&&sfxEnabled){
      const sound=getBossSpawnSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='plasma_shot'&&sfxEnabled){
      const sound=getPlasmaImpactSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='rapid_shot'&&sfxEnabled){
      const sound=getRapidImpactSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&id==='pulse_shot'&&sfxEnabled){
      const sound=getPulseImpactSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='ui'&&id==='ui_click'&&sfxEnabled){
      const sound=getUiClickSound();
      sound.currentTime=0;
      void sound.play().catch(()=>undefined);
      return;
    }
    if(category==='sfx'&&!sfxEnabled)return;
    if(import.meta.env.DEV)console.info(`[audio:${category}]`,id);
  },
  setEnabled(category,enabled){
    if(category==='music'){
      musicEnabled=enabled;
      if(enabled){
        activeMusicId=null;
        switchMusic('lobby_theme',getLobbyMusic());
      }else if(lobbyMusic){
        lobbyMusic.pause();
        lobbyMusic.currentTime=0;
      }
      if(!enabled&&battleFadeTimer){clearInterval(battleFadeTimer);battleFadeTimer=null;}
      if(!enabled&&bossFadeTimer){clearInterval(bossFadeTimer);bossFadeTimer=null;}
      if(!enabled&&battleMusic){
        battleMusic.pause();
        battleMusic.currentTime=0;
        battleMusic.volume=0.1;
      }
      if(!enabled&&bossMusic){
        bossMusic.pause();
        bossMusic.currentTime=0;
        bossMusic.volume=0.1;
      }
    }
    if(category==='sfx'){
      sfxEnabled=enabled;
      if(!enabled)stopSfxTracks();
    }
    if(import.meta.env.DEV)console.info(`[audio:${category}] enabled=${enabled}`);
  },
  stop(category){
    if(category==='music'){
      activeMusicId=null;
      if(musicWatchdog)clearInterval(musicWatchdog);
      musicWatchdog=null;
      if(battleFadeTimer)clearInterval(battleFadeTimer);
      if(bossFadeTimer)clearInterval(bossFadeTimer);
      battleFadeTimer=null;
      bossFadeTimer=null;
      if(lobbyMusic)lobbyMusic.pause();
      if(battleMusic){battleMusic.pause();battleMusic.currentTime=0;battleMusic.volume=0.1;}
      if(bossMusic){bossMusic.pause();bossMusic.currentTime=0;bossMusic.volume=0.1;}
    }
    if(category==='sfx'){
      stopSfxTracks();
    }
    if(category==='ui'&&uiClickSound){uiClickSound.pause();uiClickSound.currentTime=0;}
  },
  pause(){
    if(musicWatchdog)clearInterval(musicWatchdog);
    musicWatchdog=null;
    [lobbyMusic,battleMusic,bossMusic,defeatSound,victorySound,bossDeathSound,bossSpawnSound,plasmaImpactSound,rapidImpactSound,pulseImpactSound,uiClickSound].forEach(track=>track?.pause());
  },
  resume(){
    if(!musicEnabled||!activeMusicId||document.visibilityState==='hidden')return;
    const track=activeMusicId==='lobby_theme'?lobbyMusic:activeMusicId==='battle_theme'?battleMusic:bossMusic;
    if(track)switchMusic(activeMusicId,track);
  },
  unlock(){
    if(!musicEnabled||!activeMusicId)return;
    const track=activeMusicId==='lobby_theme'?getLobbyMusic():activeMusicId==='battle_theme'?getBattleMusic():getBossMusic();
    if(track.paused)void track.play().catch(()=>undefined);
  }
};

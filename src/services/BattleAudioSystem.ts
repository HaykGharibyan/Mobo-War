type BattleClip={buffer:AudioBuffer;start:number;duration:number};

const audioUrlMap=import.meta.glob('../Audio/*',{eager:true,query:'?url',import:'default'}) as Record<string,string>;
const audioUrls=Object.entries(audioUrlMap)
  .filter(([path])=>/\.(mp3|wav|ogg|m4a|aac)$/i.test(path))
  .map(([,url])=>url)
  .filter(Boolean);

const MAX_SIMULTANEOUS=2;

function createContext(){
  const AudioContextCtor=globalThis.AudioContext||((globalThis as typeof globalThis&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext);
  return AudioContextCtor?new AudioContextCtor():null;
}

function trimSilence(buffer:AudioBuffer):Pick<BattleClip,'start'|'duration'>{
  const sampleStep=Math.max(1,Math.floor(buffer.length/40000));
  let peak=0;
  for(let channel=0;channel<buffer.numberOfChannels;channel++){
    const data=buffer.getChannelData(channel);
    for(let index=0;index<data.length;index+=sampleStep)peak=Math.max(peak,Math.abs(data[index]));
  }
  if(peak<.0001)return {start:0,duration:buffer.duration};
  const threshold=Math.max(.006,peak*.025);
  let first=buffer.length,last=-1;
  for(let index=0;index<buffer.length;index+=sampleStep){
    let loud=false;
    for(let channel=0;channel<buffer.numberOfChannels;channel++)if(Math.abs(buffer.getChannelData(channel)[index])>=threshold){loud=true;break}
    if(loud){first=Math.min(first,index);last=index}
  }
  if(last<first)return {start:0,duration:buffer.duration};
  const padding=Math.floor(buffer.sampleRate*.014);
  const start=Math.max(0,first-padding);
  const end=Math.min(buffer.length,last+padding);
  return {start:start/buffer.sampleRate,duration:Math.max(.02,(end-start)/buffer.sampleRate)};
}

class BattleAudioController{
  private context:AudioContext|null=null;
  private masterGain:GainNode|null=null;
  private clips:BattleClip[]=[];
  private loading:Promise<void>|null=null;
  private activeSources=new Set<AudioBufferSourceNode>();
  private battleActive=false;
  private enabled=true;
  private volume=.5;
  private lastClip=-1;
  private nextAllowedAt=0;

  private ensureContext(){
    if(!this.context)this.context=createContext();
    if(!this.context)return null;
    if(!this.masterGain){this.masterGain=this.context.createGain();this.masterGain.gain.value=this.volume;this.masterGain.connect(this.context.destination)}
    return this.context;
  }

  private async loadClips(){
    if(this.loading||this.clips.length>=audioUrls.length)return this.loading||Promise.resolve();
    const context=this.ensureContext();
    if(!context)return;
    this.loading=Promise.all(audioUrls.map(async url=>{
      try{
        const response=await fetch(url);
        if(!response.ok)return null;
        const buffer=await context.decodeAudioData(await response.arrayBuffer());
        return {buffer,...trimSilence(buffer)} as BattleClip;
      }catch{return null}
    })).then(results=>{this.clips=results.filter((clip):clip is BattleClip=>!!clip)}).finally(()=>{this.loading=null});
    return this.loading;
  }

  start(){
    this.battleActive=true;
    const context=this.ensureContext();
    if(context?.state==='suspended')void context.resume().catch(()=>undefined);
    void this.loadClips();
  }

  trigger(engagedRobots:number){
    if(!this.battleActive||!this.enabled||!audioUrls.length)return;
    const context=this.ensureContext();
    if(!context||!this.clips.length||this.activeSources.size>=MAX_SIMULTANEOUS)return;
    if(context.state==='suspended')void context.resume().catch(()=>undefined);
    const now=context.currentTime;
    if(now<this.nextAllowedAt)return;
    const intensity=Math.max(0,Math.min(12,engagedRobots-2));
    const chance=Math.min(.72,.24+intensity*.035);
    if(Math.random()>chance)return;
    const choices=this.clips.map((_,index)=>index).filter(index=>index!==this.lastClip);
    const index=choices[Math.floor(Math.random()*choices.length)]??0;
    const clip=this.clips[index];
    if(!clip)return;
    this.lastClip=index;
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=clip.buffer;
    source.playbackRate.value=.92+Math.random()*.16;
    gain.gain.value=.65+Math.random()*.35;
    source.connect(gain);gain.connect(this.masterGain!);
    this.activeSources.add(source);
    source.onended=()=>{this.activeSources.delete(source);source.disconnect();gain.disconnect()};
    const duration=Math.max(.02,Math.min(clip.duration,(clip.buffer.duration-clip.start)/source.playbackRate.value));
    source.start(0,clip.start,duration);
    const cooldown=160+Math.random()*260-Math.min(110,intensity*8);
    this.nextAllowedAt=now+Math.max(90,cooldown)/1000;
  }

  stop(){
    this.battleActive=false;
    this.stopVoices();
    this.lastClip=-1;
    this.nextAllowedAt=0;
  }

  stopVoices(){
    for(const source of this.activeSources){try{source.stop()}catch{ /* already ended */ }this.activeSources.delete(source)}
  }

  setEnabled(enabled:boolean){
    this.enabled=enabled;
    if(!enabled)this.stopVoices();
  }

  setVolume(volume:number){
    this.volume=Math.max(0,Math.min(1,volume));
    if(this.masterGain)this.masterGain.gain.value=this.volume;
  }
}

export const BattleAudioSystem={
  start:()=>battleAudio.start(),
  trigger:(engagedRobots:number)=>battleAudio.trigger(engagedRobots),
  stop:()=>battleAudio.stop(),
  stopVoices:()=>battleAudio.stopVoices(),
  setEnabled:(enabled:boolean)=>battleAudio.setEnabled(enabled),
  setVolume:(volume:number)=>battleAudio.setVolume(volume),
  fileCount:audioUrls.length,
};

const battleAudio=new BattleAudioController();

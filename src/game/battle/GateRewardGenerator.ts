export type GateBonus={op:'multiply'|'add';value:number;rarity:'common'|'uncommon'|'rare'|'boss'};
export type GateRewardInput={playerBotCount:number;level:number;wave:number;threatRatio:number;bossIncoming:boolean};

/** Produces one tactical choice, keeping the highest multipliers genuinely rare. */
export class GateRewardGenerator {
  constructor(private random:()=>number){}
  generate(input:GateRewardInput):[GateBonus,GateBonus]{
    const pressure=Math.max(0,Math.min(3,input.threatRatio-1));
    const small=input.playerBotCount<16;
    const levelAdd=Math.min(10,Math.floor(Math.max(1,input.level)/10)*2);
    const pool:GateBonus[]=[
      {op:'add',value:(small?5:8)+levelAdd,rarity:'common'}, {op:'add',value:(small?8:10)+levelAdd,rarity:'common'},
      {op:'multiply',value:2,rarity:'common'}, {op:'add',value:(small?10:15)+levelAdd,rarity:'uncommon'},
      {op:'multiply',value:3,rarity:'uncommon'}, {op:'add',value:20+levelAdd,rarity:'uncommon'},
      {op:'multiply',value:4,rarity:'rare'}, {op:'multiply',value:5,rarity:'rare'},
    ];
    const weights=pool.map(reward=>{
      if(reward.value===5)return input.bossIncoming?.045:.008;
      if(reward.value===4)return input.bossIncoming?.14:.035+pressure*.018;
      if(reward.value===3)return .12+pressure*.055+(input.bossIncoming?.13:0);
      if(reward.op==='add'&&reward.value>=15)return .14+pressure*.045;
      return .34;
    });
    const pick=(blocked?:GateBonus)=>{
      const adjusted=weights.map((weight,index)=>pool[index].op===blocked?.op&&pool[index].value===blocked.value?0:weight);
      const total=adjusted.reduce((sum,weight)=>sum+weight,0);let roll=this.random()*total;
      for(let i=0;i<pool.length;i++){roll-=adjusted[i];if(roll<=0)return pool[i]}
      return pool[0];
    };
    const first=pick();const second=pick(first);
    return this.random()<.5?[first,second]:[second,first];
  }
}

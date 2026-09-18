/** Fixed bucket storage, reused each tick. Local lookups instead of all-pairs targeting. */
export class SpatialGrid {
  private buckets:number[][]=Array.from({length:120},()=>[]);
  clear(){for(const bucket of this.buckets)bucket.length=0}
  insert(id:number,x:number,y:number){this.buckets[this.key(x,y)]?.push(id)}
  private key(x:number,y:number){return Math.max(0,Math.min(11,Math.floor(y/70)))*10+Math.max(0,Math.min(9,Math.floor(x/45)))}
  visit(x:number,y:number,radius:number,fn:(id:number)=>void){
    const x0=Math.max(0,Math.floor((x-radius)/45)),x1=Math.min(9,Math.floor((x+radius)/45));
    const y0=Math.max(0,Math.floor((y-radius)/70)),y1=Math.min(11,Math.floor((y+radius)/70));
    for(let row=y0;row<=y1;row++)for(let col=x0;col<=x1;col++)for(const id of this.buckets[row*10+col])fn(id);
  }
}

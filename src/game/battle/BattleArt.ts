import Phaser from 'phaser';
import type { WorldTheme } from '../worlds/WorldConfig';

/** Original cartoon textures drawn once, shared by all pooled sprites. */
export function makeBattleArt(scene:Phaser.Scene,world:WorldTheme){
  const texture=(name:string,w:number,h:number,draw:(c:CanvasRenderingContext2D)=>void)=>{if(scene.textures.exists(name))return;const t=scene.textures.createCanvas(name,w,h)!;draw(t.context);t.refresh()};
  for(const [name,light,dark] of [['blue','#48d9ff','#0758c2'],['red','#ff8770','#bf233d'],['tank','#e885a8','#6b284c']])texture('bot-'+name,64,78,c=>{
    const box=(x:number,y:number,w:number,h:number,r:number,fill:string)=>{c.fillStyle=fill;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
    box(19,53,10,15,4,dark);box(36,53,10,15,4,dark);box(9,37,9,21,4,dark);box(47,37,9,21,4,dark);
    const body=c.createLinearGradient(17,30,48,55);body.addColorStop(0,light);body.addColorStop(1,dark);c.fillStyle=body;c.beginPath();c.roundRect(17,30,30,28,9);c.fill();
    const head=c.createRadialGradient(23,14,1,33,24,25);head.addColorStop(0,'#d0f9ff');head.addColorStop(.24,light);head.addColorStop(1,dark);c.fillStyle=head;c.beginPath();c.roundRect(12,5,41,33,13);c.fill();
    box(19,20,28,10,5,'#083350');box(23,23,7,3,1,'#aeffff');box(36,23,7,3,1,'#aeffff');box(26,39,12,7,2,'#e6fbff');box(29,41,6,3,1,light);
  });
  const skins={default:{main:'#36caff',dark:'#0866c6',accent:'#c7f8ff',glow:'#63e8ff'},ninja:{main:'#4b526f',dark:'#15192f',accent:'#e9d9ff',glow:'#b84dff'},knight:{main:'#9aafc9',dark:'#3a4e73',accent:'#ffe693',glow:'#ffd14d'},cyber:{main:'#25e3cf',dark:'#075fab',accent:'#ff6ce6',glow:'#45fff2'},golden:{main:'#ffd450',dark:'#b76508',accent:'#fff3ba',glow:'#ffb51d'},blackgold:{main:'#f0bd3d',dark:'#17141b',accent:'#fff1a6',glow:'#ffcf45'}} as const;
  const rounded=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number,color:string)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
  const gradient=(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,top:string,bottom:string)=>{const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,top);g.addColorStop(1,bottom);return g};
  const player=(kind:'basic'|'runner'|'tank',skin:keyof typeof skins,back=false)=>texture(`bot-player-${skin}-${kind}${back?'-back':''}`,112,128,c=>{
    const p=skins[skin],shine=gradient(c,24,18,62,78,p.accent,p.main),armor=gradient(c,21,40,70,68,p.main,p.dark);
    c.save();c.shadowColor=p.glow;c.shadowBlur=8;
    if(kind==='basic'){
      rounded(c,24,84,17,26,6,p.dark);rounded(c,71,84,17,26,6,p.dark);rounded(c,10,55,17,34,7,p.dark);rounded(c,85,55,17,34,7,p.dark);
      c.fillStyle=armor;c.beginPath();c.roundRect(24,49,64,48,15);c.fill();c.fillStyle=shine;c.beginPath();c.roundRect(21,20,70,42,17);c.fill();
      rounded(c,30,36,52,14,7,'#082d56');rounded(c,36,40,11,5,2,p.accent);rounded(c,65,40,11,5,2,p.accent);rounded(c,41,65,30,13,4,p.accent);rounded(c,81,63,23,13,5,p.dark);rounded(c,96,66,11,8,3,p.glow);
    }else if(kind==='runner'){
      rounded(c,27,82,15,33,6,p.dark);rounded(c,70,82,15,33,6,p.dark);rounded(c,16,102,27,10,5,p.main);rounded(c,69,102,27,10,5,p.main);
      rounded(c,17,59,14,29,6,p.dark);rounded(c,82,59,14,29,6,p.dark);c.fillStyle=armor;c.beginPath();c.roundRect(31,50,50,44,14);c.fill();c.fillStyle=shine;c.beginPath();c.roundRect(26,23,60,35,16);c.fill();
      rounded(c,31,36,50,12,6,'#071e49');rounded(c,40,39,30,4,2,p.accent);rounded(c,78,59,24,10,5,p.dark);rounded(c,96,61,10,6,3,p.glow);rounded(c,15,82,13,21,5,p.glow);rounded(c,84,82,13,21,5,p.glow);
    }else{
      rounded(c,12,91,38,22,8,p.dark);rounded(c,62,91,38,22,8,p.dark);for(const x of [18,33,68,83]){c.fillStyle='#061b35';c.beginPath();c.arc(x,104,6,0,Math.PI*2);c.fill()}
      rounded(c,5,51,25,35,10,p.dark);rounded(c,82,51,25,35,10,p.dark);c.fillStyle=armor;c.beginPath();c.roundRect(17,46,78,55,17);c.fill();c.fillStyle=shine;c.beginPath();c.roundRect(20,18,72,39,15);c.fill();
      rounded(c,28,32,56,15,7,'#071e49');rounded(c,37,37,13,5,2,p.accent);rounded(c,63,37,13,5,2,p.accent);rounded(c,33,64,45,17,5,p.accent);rounded(c,70,56,35,15,6,p.dark);rounded(c,95,59,14,10,3,p.glow);
    }
    c.shadowBlur=0;c.lineWidth=3;c.strokeStyle=p.dark;c.beginPath();c.roundRect(kind==='tank'?17:kind==='runner'?26:21,kind==='tank'?18:kind==='runner'?23:20,kind==='tank'?78:kind==='runner'?60:70,kind==='tank'?82:kind==='runner'?72:78,kind==='tank'?16:14);c.stroke();
    c.fillStyle=p.accent;c.globalAlpha=.92;c.beginPath();c.arc(56,67,4,0,Math.PI*2);c.fill();c.globalAlpha=1;
    for(const [x,y] of kind==='tank'?[[24,58],[88,58],[28,92],[84,92]]:kind==='runner'?[[34,57],[77,57],[39,91],[73,91]]:[[29,54],[83,54],[31,91],[81,91]]){c.fillStyle=p.accent;c.beginPath();c.arc(x,y,2.2,0,Math.PI*2);c.fill();c.fillStyle=p.dark;c.beginPath();c.arc(x-.7,y-.7,1,0,Math.PI*2);c.fill()}
    if(kind==='tank'){c.strokeStyle=p.accent;c.lineWidth=3;c.beginPath();c.moveTo(25,79);c.lineTo(87,79);c.stroke();}
    if(kind==='runner'){c.strokeStyle=p.glow;c.lineWidth=2;c.beginPath();c.moveTo(39,67);c.lineTo(73,67);c.stroke();}
    if(skin==='ninja'){rounded(c,17,24,78,7,3,'#191328');c.fillStyle=p.glow;c.fillRect(88,21,16,5);c.fillRect(98,17,5,13)}
    if(skin==='knight'){c.fillStyle=p.accent;c.beginPath();c.moveTo(56,8);c.lineTo(64,21);c.lineTo(48,21);c.closePath();c.fill();rounded(c,39,72,34,6,3,'#d69b2e')}
    if(skin==='cyber'){c.strokeStyle=p.accent;c.lineWidth=3;c.beginPath();c.moveTo(30,68);c.lineTo(47,68);c.lineTo(47,88);c.moveTo(82,68);c.lineTo(65,68);c.lineTo(65,88);c.stroke()}
    if(skin==='golden'){rounded(c,31,14,50,7,3,p.accent);for(const x of [38,55,72])rounded(c,x,7,7,11,3,p.accent)}
    if(skin==='blackgold'){rounded(c,29,14,54,7,3,'#111016');rounded(c,35,73,42,7,3,p.accent);c.fillStyle=p.accent;c.fillRect(37,52,8,3);c.fillRect(67,52,8,3)}
    if(back){
      // The marching view keeps the head above the feet and replaces the face with rear armor.
      const headX=kind==='tank'?20:kind==='runner'?26:21,headY=kind==='runner'?23:kind==='tank'?18:20,headW=kind==='tank'?72:kind==='runner'?60:70,headH=kind==='tank'?39:kind==='runner'?35:42;
      c.shadowBlur=0;c.fillStyle=gradient(c,headX,headY,headW,headH,p.accent,p.dark);c.beginPath();c.roundRect(headX,headY,headW,headH,16);c.fill();
      c.strokeStyle=p.dark;c.lineWidth=3;c.stroke();rounded(c,45,headY+5,22,12,5,p.accent);
      rounded(c,kind==='tank'?31:37,65,kind==='tank'?50:38,24,7,p.dark);
      rounded(c,kind==='tank'?36:42,68,kind==='tank'?40:28,16,5,p.main);
      rounded(c,49,72,14,7,3,p.accent);
      if(skin==='ninja')rounded(c,18,headY+6,76,6,3,p.glow);
      if(skin==='knight')rounded(c,46,headY+2,20,12,3,'#d69b2e');
      if(skin==='cyber'){c.strokeStyle=p.glow;c.lineWidth=2;c.strokeRect(40,66,32,24)}
      if(skin==='golden')for(const x of [45,56,67])rounded(c,x,headY+4,5,8,2,p.accent);
      if(skin==='blackgold'){rounded(c,32,headY+4,48,6,3,'#111016');rounded(c,42,68,28,8,3,p.accent);c.fillStyle=p.accent;c.fillRect(45,48,7,3);c.fillRect(60,48,7,3)}
    }
    c.restore();
  });
  const enemy=(kind:'basic'|'fast'|'tank'|'miniBoss'|'boss',skin:'green'|'ice'|'dark'|'wasteland'|'lava')=>texture(`bot-enemy-${skin}-${kind}`,112,128,c=>{
    const palettes={green:{basic:'#37c967',fast:'#6fe48a',tank:'#249954',elite:'#45c994',boss:'#178246',dark:'#123d29',accent:'#eaffc5',glow:'#7dff98'},ice:{basic:'#5bc8ed',fast:'#86eaff',tank:'#4c91d1',elite:'#87c9ff',boss:'#5b72ff',dark:'#172f69',accent:'#e8fbff',glow:'#63eaff'},dark:{basic:'#bd5ce2',fast:'#e487f1',tank:'#7c5ac7',elite:'#bd75ef',boss:'#7c4dff',dark:'#24134d',accent:'#f2d8ff',glow:'#d26bff'},wasteland:{basic:'#d87849',fast:'#f0a15a',tank:'#9b7049',elite:'#c68b55',boss:'#b94c35',dark:'#512b2c',accent:'#ffe0a0',glow:'#ffae55'},lava:{basic:'#e34b42',fast:'#ff934b',tank:'#a93845',elite:'#e75d4c',boss:'#ff5a2f',dark:'#4b1025',accent:'#ffe05f',glow:'#ff6d35'}} as const;
    const palette=palettes[skin],main=palette[kind==='boss'?'boss':kind==='miniBoss'?'elite':kind],dark=palette.dark,accent=palette.accent;
    c.save();c.shadowColor=main;c.shadowBlur=7;
    if(kind==='fast'){
      rounded(c,28,83,14,30,6,dark);rounded(c,70,83,14,30,6,dark);rounded(c,15,60,14,29,6,dark);rounded(c,83,60,14,29,6,dark);c.fillStyle=gradient(c,30,49,50,47,main,dark);c.beginPath();c.roundRect(30,49,51,46,14);c.fill();c.fillStyle=gradient(c,27,22,59,36,accent,main);c.beginPath();c.roundRect(26,22,60,35,15);c.fill();
      c.fillStyle='#2b1730';c.beginPath();c.moveTo(31,39);c.lineTo(81,39);c.lineTo(72,49);c.lineTo(40,49);c.closePath();c.fill();rounded(c,37,41,30,4,2,'#fff2cc');for(const x of [21,88]){c.fillStyle=main;c.beginPath();c.moveTo(x,72);c.lineTo(x+(x<50?-13:13),83);c.lineTo(x,87);c.closePath();c.fill()}
    }else{
      const giant=kind==='boss'||kind==='miniBoss',wide=kind==='tank'||giant;
      const left=wide?9:20,right=wide?103:92,bodyX=wide?14:25,bodyW=wide?84:62,headX=wide?17:21,headW=wide?78:70;
      rounded(c,left,88,wide?36:18,25,7,dark);rounded(c,right-(wide?36:18),88,wide?36:18,25,7,dark);rounded(c,wide?3:10,53,wide?27:17,34,8,dark);rounded(c,wide?82:85,53,wide?27:17,34,8,dark);
      c.fillStyle=gradient(c,bodyX,47,bodyW,55,main,dark);c.beginPath();c.roundRect(bodyX,47,bodyW,55,wide?18:15);c.fill();c.fillStyle=gradient(c,headX,18,headW,42,accent,main);c.beginPath();c.roundRect(headX,18,headW,42,16);c.fill();
      rounded(c,headX+10,34,headW-20,14,7,'#30152b');rounded(c,headX+17,39,13,4,2,accent);rounded(c,headX+headW-30,39,13,4,2,accent);rounded(c,bodyX+bodyW-20,59,30,14,5,dark);rounded(c,bodyX+bodyW+2,62,13,8,3,accent);
      if(giant){c.fillStyle=accent;c.beginPath();c.moveTo(42,18);c.lineTo(50,5);c.lineTo(57,18);c.lineTo(65,5);c.lineTo(72,18);c.closePath();c.fill();rounded(c,37,70,39,10,4,accent)}
    }
    c.shadowColor=palette.glow;c.shadowBlur=5;
    if(skin==='ice'){c.strokeStyle=accent;c.lineWidth=2;c.beginPath();c.moveTo(34,24);c.lineTo(42,14);c.lineTo(48,24);c.moveTo(64,24);c.lineTo(70,14);c.lineTo(78,24);c.stroke()}
    if(skin==='dark'){c.fillStyle=palette.glow;c.beginPath();c.arc(31,28,3,0,Math.PI*2);c.arc(81,28,3,0,Math.PI*2);c.fill()}
    if(skin==='wasteland'){c.fillStyle=accent;c.fillRect(28,53,56,5);c.fillStyle=dark;c.fillRect(38,53,8,5);c.fillRect(65,53,8,5)}
    if(skin==='lava'){c.fillStyle=palette.glow;c.beginPath();c.moveTo(39,29);c.lineTo(45,17);c.lineTo(50,29);c.moveTo(62,29);c.lineTo(68,17);c.lineTo(73,29);c.fill()}
    c.restore();
  });
  for(const skin of Object.keys(skins) as Array<keyof typeof skins>)for(const kind of ['basic','runner','tank'] as const){player(kind,skin);player(kind,skin,true)}
  for(const skin of ['green','ice','dark','wasteland','lava'] as const)for(const kind of ['basic','fast','tank','miniBoss','boss'] as const)enemy(kind,skin);
  texture('battle-cannon',160,190,c=>{
    const box=(x:number,y:number,w:number,h:number,r:number,color:string)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill()};
    const stroke=(x:number,y:number,w:number,h:number,r:number,color:string,width=3)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.roundRect(x,y,w,h,r);c.stroke()};
    c.fillStyle='#03182b88';c.beginPath();c.ellipse(80,169,67,16,0,0,7);c.fill();
    const steel=c.createLinearGradient(0,74,0,165);steel.addColorStop(0,'#4f8cae');steel.addColorStop(.28,'#173d63');steel.addColorStop(1,'#071c38');
    box(12,102,39,58,12,'#092542');box(109,102,39,58,12,'#092542');stroke(12,102,39,58,12,'#78d7f5',3);stroke(109,102,39,58,12,'#78d7f5',3);
    for(const x of [21,118])for(let y=113;y<151;y+=13){box(x,y,21,5,2,'#2a6383');box(x+3,y+1,15,2,1,'#70d7ef')}
    c.fillStyle=steel;c.beginPath();c.roundRect(31,82,98,79,23);c.fill();stroke(31,82,98,79,23,'#a5ecff',4);box(47,119,66,25,8,'#0a294d');stroke(47,119,66,25,8,'#59d6f4',2);
    for(const x of [55,105]){c.fillStyle='#ffd35a';c.beginPath();c.arc(x,132,5,0,Math.PI*2);c.fill();c.fillStyle='#9d5d16';c.beginPath();c.arc(x,132,2,0,Math.PI*2);c.fill()}
    const barrel=c.createLinearGradient(49,0,111,0);barrel.addColorStop(0,'#0a3d74');barrel.addColorStop(.22,'#31bfe9');barrel.addColorStop(.5,'#b9f8ff');barrel.addColorStop(.72,'#1874bd');barrel.addColorStop(1,'#052852');
    c.fillStyle=barrel;c.beginPath();c.roundRect(51,19,58,103,19);c.fill();stroke(51,19,58,103,19,'#b4f5ff',4);
    box(43,39,74,13,6,'#0b427a');stroke(43,39,74,13,6,'#54d9f6',2);box(45,78,70,13,6,'#0b427a');stroke(45,78,70,13,6,'#54d9f6',2);
    c.fillStyle='#d9ffff';c.beginPath();c.ellipse(80,21,27,15,0,0,7);c.fill();stroke(53,7,54,29,14,'#65e8ff',3);c.fillStyle='#06274b';c.beginPath();c.ellipse(80,21,18,9,0,0,7);c.fill();c.fillStyle='#47e9ff';c.beginPath();c.ellipse(80,21,9,4,0,0,7);c.fill();
    box(66,93,28,22,7,'#126996');stroke(66,93,28,22,7,'#b5f8ff',2);c.fillStyle='#fff4a3';c.beginPath();c.arc(80,104,4,0,Math.PI*2);c.fill();
    box(48,154,64,10,5,'#0b2948');stroke(48,154,64,10,5,'#3d9bb8',2);c.fillStyle='#45e8ff';c.beginPath();c.arc(80,159,3,0,Math.PI*2);c.fill();
  });
  texture('battle-pulse-shot',24,54,c=>{
    c.shadowColor='#46eaff';c.shadowBlur=12;c.fillStyle='#b9ffff';c.beginPath();c.roundRect(7,3,10,48,5);c.fill();c.fillStyle='#27c8ff';c.beginPath();c.roundRect(4,15,16,24,8);c.fill();c.fillStyle='#eaffff';c.beginPath();c.ellipse(12,10,5,7,0,0,7);c.fill();c.fillStyle='#75f5ff';c.fillRect(9,41,6,9);
  });
  texture('battle-fortress',300,190,c=>{
    const box=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h)};
    c.fillStyle='#174e5644';c.beginPath();c.ellipse(150,171,140,17,0,0,7);c.fill();box(48,73,203,93,'#977e65');box(48,73,203,9,'#f1d5a1');
    for(let y=92;y<166;y+=20)for(let x=51+(y%40?0:12);x<248;x+=28){box(x,y,24,2,'#715e50');box(x,y,2,16,'#b6a181')}
    for(const x of [21,225]){const g=c.createLinearGradient(x,0,x+55,0);g.addColorStop(0,'#ead4a1');g.addColorStop(.6,'#bca47f');g.addColorStop(1,'#8f7763');c.fillStyle=g;c.fillRect(x,51,55,120);box(x-5,48,65,14,'#f0d6a4');for(let i=0;i<3;i++)box(x-4+i*23,34,16,20,'#dcc99e');box(x+19,86,16,28,'#584c49');box(x+22,89,5,22,'#ab925f');c.fillStyle='#cf3340';c.beginPath();c.moveTo(x-9,34);c.lineTo(x+27,5);c.lineTo(x+64,34);c.fill();box(x+26,-1,3,23,'#815735');box(x+29,0,24,13,'#fa4d50')}
    c.fillStyle='#52463e';c.beginPath();c.roundRect(111,86,80,86,[32,32,0,0]);c.fill();c.strokeStyle='#f0c984';c.lineWidth=7;c.stroke();for(let x=120;x<190;x+=13)box(x,102,4,65,'#9e7650');box(115,120,70,7,'#be9b66');box(115,148,70,7,'#be9b66');box(130,55,40,23,'#c82f3d');c.fillStyle='#ffe296';c.font='bold 19px sans-serif';c.textAlign='center';c.fillText('♜',150,74);
  });
  texture('battle-land',390,780,c=>{
    const palette=world.battlefieldTheme;const sky=c.createLinearGradient(0,0,0,780);sky.addColorStop(0,palette.sky[0]);sky.addColorStop(.28,palette.sky[1]);sky.addColorStop(1,palette.ground);c.fillStyle=sky;c.fillRect(0,0,390,780);
    for(let i=0;i<65;i++){c.fillStyle='#bcffff33';c.fillRect((i*97)%390,130+(i*79)%650,8+(i%5)*6,2)}
    const poly=(pts:number[],color:string)=>{c.fillStyle=color;c.beginPath();c.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)c.lineTo(pts[i],pts[i+1]);c.closePath();c.fill()};
    poly([0,70,390,70,390,192,310,166,80,166,0,203],palette.ground);poly([0,780,0,655,59,618,331,618,390,655,390,780],palette.ground);poly([15,724,60,152,330,152,375,724],palette.mist);poly([29,735,61,164,329,164,361,735],palette.roadEdge);poly([39,735,72,164,318,164,351,735],palette.road);
    for(let row=0;row<16;row++){const y=174+row*34,inset=71-row*1.9;for(let col=0;col<5;col++){c.fillStyle=row%2?palette.road:palette.roadEdge;c.globalAlpha=.82;c.beginPath();c.roundRect(inset+col*((390-inset*2)/5)+2,y,((390-inset*2)/5)-4,31,3);c.fill();c.globalAlpha=1}}
    for(const side of [0,1]){const x=side?329:48;poly([x,170,x+13,166,x+(side?31:-18),689,x+(side?18:-31),692],palette.roadEdge);for(let i=0;i<8;i++){const y=205+i*59,xx=x+(side?1:-1)*i*3.4;c.fillStyle=palette.trim;c.fillRect(xx,y,14,15);c.fillStyle=palette.decor;c.fillRect(xx-2,y-3,18,8)}}
    for(let i=0;i<22;i++){const x=i%2?370-(i%3)*7:13+(i%3)*6,y=170+(i*47)%570;c.fillStyle=palette.mist;c.beginPath();c.ellipse(x+3,y+12,17,8,0,0,7);c.fill();c.fillStyle=palette.decor;c.beginPath();c.arc(x,y,10+(i%4)*2,0,7);c.fill();if(world.particleStyle==='snow'||world.particleStyle==='ash'){c.fillStyle=world.particleStyle==='snow'?'#efffffaa':'#ffb35c88';c.fillRect(x-3,y-18,4,4)}}
    c.strokeStyle=palette.decor;c.lineWidth=3;c.beginPath();c.ellipse(195,711,65,22,0,0,7);c.stroke();
    if(world.key==='lava'){c.strokeStyle='#ff522f';c.lineWidth=5;for(const x of [83,307]){c.beginPath();c.moveTo(x,680);c.lineTo(x+12,640);c.lineTo(x-5,604);c.stroke()}}
    if(world.key==='dark'){c.fillStyle='#cf7cff';for(const x of [30,360,20,370]){c.beginPath();c.arc(x,480+(x%3)*60,7,0,7);c.fill()}}
  });
}

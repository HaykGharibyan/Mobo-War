import QRCode from 'qrcode';
import os from 'node:os';
import { mkdir } from 'node:fs/promises';
const nets=os.networkInterfaces();
const ip=Object.values(nets).flat().find(x=>x && x.family==='IPv4' && !x.internal)?.address || 'localhost';
const url=`http://${ip}:5173/`;
await mkdir('public',{recursive:true});
await QRCode.toFile('public/mobo-war-qr.png',url,{width:600,margin:2,color:{dark:'#06224d',light:'#ffffff'}});
console.log(`QR generated for ${url}`);

const http = require('http');
const fs = require('fs');
const path = require('path');

const apkPath = path.resolve(__dirname, '..', 'releases', 'mobo-war-debug.apk');
const fileName = 'mobo-war-debug.apk';
const port = Number(process.env.MOBO_APK_PORT || 5180);

http.createServer((request, response) => {
  if (request.url !== '/' && request.url !== `/${fileName}`) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('APK not found');
    return;
  }
  const size = fs.statSync(apkPath).size;
  response.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Length': size,
    'Content-Disposition': `attachment; filename="${fileName}"`,
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(apkPath).pipe(response);
}).listen(port, '0.0.0.0', () => console.log(`APK server: http://0.0.0.0:${port}/${fileName}`));

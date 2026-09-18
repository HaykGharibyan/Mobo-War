import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve } from 'node:path';

const apkPath = resolve('android/app/build/outputs/apk/debug/app-debug.apk');
const server = createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method) || request.url !== '/app-debug.apk') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('APK not found');
    return;
  }

  try {
    const { size } = statSync(apkPath);
    response.writeHead(200, {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Length': size,
      'Content-Disposition': 'attachment; filename="mobo-war-debug.apk"',
      'Cache-Control': 'no-store',
    });
    if (request.method === 'GET') createReadStream(apkPath).pipe(response);
    else response.end();
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Build the APK first');
  }
});

server.listen(8000, '0.0.0.0', () => {
  console.log('APK download server: http://0.0.0.0:8000/app-debug.apk');
});

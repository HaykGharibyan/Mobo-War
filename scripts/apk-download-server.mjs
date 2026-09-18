import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

// APKs are release artifacts, never runtime web assets. Keeping them under
// releases/ prevents Vite from bundling an APK inside the next APK.
const apkPath = resolve(process.cwd(), 'releases', 'mobo-war-debug.apk');
const port = 5176;

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;

  if (pathname !== '/mobo-war-debug.apk') {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('APK not found');
    return;
  }

  const { size } = statSync(apkPath);
  response.writeHead(200, {
    'Content-Type': 'application/vnd.android.package-archive',
    'Content-Disposition': 'attachment; filename="mobo-war-debug.apk"',
    'Content-Length': size,
    'Cache-Control': 'no-store',
  });

  if (request.method === 'HEAD') {
    response.end();
    return;
  }

  createReadStream(apkPath).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`APK download server: http://192.168.10.16:${port}/mobo-war-debug.apk`);
});

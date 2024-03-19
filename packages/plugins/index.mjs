import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import handler from 'serve-handler';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pluginDirName = 'dev';
const pluginPath = path.join(__dirname, pluginDirName);

const server = http.createServer((request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.setHeader('Pragma', 'no-cache');
  response.setHeader('Expires', '0');

  if (request.url === '/list') {
    fs.readdir(pluginPath, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error(err);
        response.writeHead(500);
        response.end('Server error');
        return;
      }

      const fileList = files
        .filter(dirent => dirent.isFile())
        .map(dirent => `dev/${dirent.name}`);

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(fileList));
    });
  } else {
    // Fallback to serve-handler for other routes
    return handler(request, response);
  }
});

const wss = new WebSocketServer({ server, verifyClient: (info, cb) => cb(true)});

wss.on('connection', function connection(ws) {
  console.log('A client connected');
});

// Watch the plugin directory for changes
fs.watch(pluginPath, { recursive: true }, (eventType, filename) => {
  if (filename) {
    console.log(`File changed: ${filename}`);
    console.log(`emitting: ${path.join(pluginDirName, filename)}`)
    // Emit a message to all connected clients
    wss.clients.forEach(function each(client) {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          eventType,
          path: path.join(pluginDirName, filename)
        }));
      }
    });
  }
});

server.listen(1993, () => {
  console.log('Plugin Dev Server running at http://localhost:1993');
});
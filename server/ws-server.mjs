// Minimal collaboration relay: every message a client sends is forwarded to all other clients.
// The clients resolve conflicts (last-write-wins per entity) and the oldest session hands its
// project to newcomers, so this server stays completely stateless.
//
//   npm run ws            → ws://localhost:8080
//   PORT=9000 npm run ws  → ws://localhost:9000
import { WebSocketServer } from 'ws';

const port = Number(process.env.PORT ?? 8080);
const wss  = new WebSocketServer({ port });

wss.on('connection', (socket) => {
  socket.on('message', (data) => {
    const frame = data.toString();
    for (const client of wss.clients) {
      if (client !== socket && client.readyState === 1) client.send(frame);
    }
  });
});

console.log(`RoomVision 3D relay listening on ws://localhost:${port}`);

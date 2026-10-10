require('dotenv').config();

const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const cors     = require('cors');
const { v4: uuidv4 } = require('uuid');
const { registerSocketHandler, rooms } = require('./handlers/socketHandler');

const app    = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT       = process.env.PORT       || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin:      CLIENT_URL,
    methods:     ['GET', 'POST'],
    credentials: true,
  },
  // Allow large seek payloads
  maxHttpBufferSize: 1e6,
});

registerSocketHandler(io);

// ── REST endpoints ────────────────────────────────────────────────────────────

/** Generate a new room ID without actually creating the room */
app.get('/api/new-room', (_req, res) => {
  // 6-char uppercase code, easy to share
  const roomId = uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase();
  res.json({ roomId });
});

/** Basic room info (participant count, whether room exists) */
app.get('/api/room/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({
    roomId:           room.roomId,
    participantCount: room.participantCount,
    videoId:          room.videoState.videoId,
    createdAt:        room.createdAt,
  });
});

// Health check for deployment platforms
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅  Server listening on port ${PORT}`);
  console.log(`   Allowing client origin: ${CLIENT_URL}`);
});

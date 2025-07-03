require('dotenv').config({ path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env' });
const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
});

// Store FEN for each room
const games = {};

io.on('connection', (socket) => {
  let currentRoom = null;

  socket.on('join', (room) => {
    socket.join(room);
    currentRoom = room;
    if (!games[room]) {
      // New game
      games[room] = {
        fen: null, // Will be set by first move
      };
    }
    // Send current FEN to the new player
    socket.emit('fen', games[room].fen);
  });

  socket.on('move', ({ room, move, fen }) => {
    games[room].fen = fen;
    socket.to(room).emit('move', { move, fen });
  });

  socket.on('disconnect', () => {
    // Optionally handle cleanup
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
}); 
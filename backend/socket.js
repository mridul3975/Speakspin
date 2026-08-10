import { Server } from 'socket.io';

const TOPICS = [
  { category: 'Technology', topic: 'Is AI a threat or a tool for human creativity?' },
  { category: 'Education', topic: 'Should exams be completely replaced by projects?' },
  { category: 'Environment', topic: 'How small changes in daily life impact global warming.' },
  { category: 'Business & Career', topic: 'The importance of networking in the modern professional landscape.' },
  { category: 'Self-Improvement', topic: 'Does success come from luck or hard work?' },
  { category: 'Social Issues', topic: 'The influence of social media on teenage mental health.' },
  { category: 'Arts & Culture', topic: 'Why historical preservation matters in the digital age.' },
  { category: 'Philosophy', topic: 'What is the meaning of a happy life?' }
];

let lobby = []; // Array of { socketId, userId, name }
const activeRooms = new Map(); // RoomID -> { players: [], scores: {} }

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*', // Allow all origins for the branch experiment
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join Matchmaking Lobby
    socket.on('joinLobby', ({ userId, name }) => {
      // Clean up player from any previous rooms or lobby
      leaveLobbyAndRooms(socket);

      // Check if lobby already has someone waiting
      if (lobby.length > 0) {
        const opponent = lobby.shift();
        
        // Prevent matching with self
        if (opponent.userId === userId) {
          lobby.push(opponent);
          socket.emit('waitingInLobby', { message: 'Still waiting for an opponent...' });
          return;
        }

        const roomId = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

        const roomState = {
          id: roomId,
          topic: randomTopic,
          players: [
            { id: socket.id, userId, name },
            { id: opponent.socketId, userId: opponent.userId, name: opponent.name }
          ],
          submissions: {} // socketId -> { score, transcript, name }
        };

        activeRooms.set(roomId, roomState);

        // Join both sockets to the room
        socket.join(roomId);
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
          opponentSocket.join(roomId);
        }

        // Notify both players
        io.to(roomId).emit('matchFound', {
          roomId,
          topic: randomTopic,
          players: roomState.players
        });
        
        console.log(`Match matched: ${opponent.name} vs ${name} in room ${roomId}`);
      } else {
        lobby.push({ socketId: socket.id, userId, name });
        socket.emit('waitingInLobby', { message: 'Searching for an opponent...' });
        console.log(`Player added to lobby: ${name} (${socket.id})`);
      }
    });

    // Notify partner that player is starting recording countdown
    socket.on('playerStateUpdate', ({ roomId, state }) => {
      socket.to(roomId).emit('opponentStateUpdated', { state });
    });

    // Submit Speech Score after analysis
    socket.on('submitScore', ({ roomId, score, transcript, name }) => {
      const room = activeRooms.get(roomId);
      if (!room) {
        socket.emit('errorMsg', { message: 'Room not found.' });
        return;
      }

      room.submissions[socket.id] = { score, transcript, name };
      console.log(`Score submitted in ${roomId} by ${name}: ${score}`);

      const submittedCount = Object.keys(room.submissions).length;

      // If both players submitted scores
      if (submittedCount === 2) {
        const submissions = Object.values(room.submissions);
        const p1 = submissions[0];
        const p2 = submissions[1];

        let winnerName = 'Draw';
        let winnerId = null;

        if (p1.score > p2.score) {
          winnerName = p1.name;
        } else if (p2.score > p1.score) {
          winnerName = p2.name;
        }

        io.to(roomId).emit('battleFinished', {
          winnerName,
          p1: { name: p1.name, score: p1.score, transcript: p1.transcript },
          p2: { name: p2.name, score: p2.score, transcript: p2.transcript }
        });

        // Clean up room state
        activeRooms.delete(roomId);
        console.log(`Battle finished and cleaned in ${roomId}. Winner: ${winnerName}`);
      } else {
        // Notify the opponent that player submitted their score
        socket.to(roomId).emit('opponentSubmittedScore', { opponentName: name });
      }
    });

    // Cancel lobby search or leave room
    socket.on('leaveBattle', () => {
      leaveLobbyAndRooms(socket);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      leaveLobbyAndRooms(socket);
    });
  });

  function leaveLobbyAndRooms(socket) {
    // Remove from lobby
    lobby = lobby.filter(p => p.socketId !== socket.id);

    // Remove from active rooms
    for (const [roomId, room] of activeRooms.entries()) {
      const playerInRoom = room.players.find(p => p.id === socket.id);
      if (playerInRoom) {
        socket.to(roomId).emit('opponentLeft', { message: 'Your opponent disconnected from the battle.' });
        activeRooms.delete(roomId);
        console.log(`Opponent left room ${roomId}. Room terminated.`);
      }
    }
  }
}

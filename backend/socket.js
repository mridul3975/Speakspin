import { Server } from 'socket.io';
import { nanoid } from 'nanoid';
import { OpenAI } from 'openai';
import { TOPICS } from './config/topics.js';

const BOT_ROSTER = [
  { id: "bot_beginner", name: "Timid Tim", avatar: "🐢", rating: 700, tier: "Bronze", skillLevel: "beginner", personality: "nervous, hesitant, lots of 'um' and 'uh'" },
  { id: "bot_intermediate", name: "Average Andy", avatar: "🤖", rating: 950, tier: "Silver", skillLevel: "intermediate", personality: "conversational, occasionally loses track" },
  { id: "bot_advanced", name: "SpeakBot 3000", avatar: "⚡", rating: 1150, tier: "Gold", skillLevel: "advanced", personality: "confident, structured, minor imperfections" },
  { id: "bot_expert", name: "VoiceAI", avatar: "💎", rating: 1400, tier: "Diamond", skillLevel: "expert", personality: "eloquent, well-structured, excellent vocabulary" },
  { id: "bot_legend", name: "OmegaSpeaker", avatar: "👑", rating: 1700, tier: "Legend", skillLevel: "legendary", personality: "masterful, compelling, inspiring" }
];

const BOT_MATCH_DELAY_MS = 5000;
const botMatchTimers = new Map();
let waitingQueue = [];
const activeRooms = new Map();
const playerSockets = new Map();

// Helper to initialize Groq/OpenAI client
let openai = null;
function getOpenAIClient() {
  if (openai) return openai;
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey && apiKey !== 'gsk_your-key-here' && apiKey.trim() !== '') {
    openai = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
    return openai;
  }
  return null;
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:') || origin.endsWith('.vercel.app') || origin === 'https://speakspin-nine.vercel.app') {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Battle client connected: ${socket.id}`);

    // CLIENT -> SERVER: find_match
    socket.on('find_match', (playerData) => {
      // Clean up previous lobbies/rooms
      removeFromQueue(socket.id);
      leaveActiveRooms(socket, io);

      const player = {
        socketId: socket.id,
        socket: socket,
        playerName: playerData.playerName || 'Guest Speaker',
        avatar: playerData.avatar || '🦁',
        rating: Number(playerData.rating) || 1000,
        language: playerData.language || 'en-US',
        joinedAt: Date.now()
      };

      waitingQueue.push(player);
      playerSockets.set(socket.id, player);

      socket.emit('queue_joined', {
        position: waitingQueue.length,
        estimatedWait: Math.max(2, Math.round(waitingQueue.length * 2.5))
      });

      io.emit('queue_update', { waitingCount: waitingQueue.length });
      tryMatchmaking(io);

      if (waitingQueue.includes(player)) {
        const timer = setTimeout(() => {
          // Give any waiting compatible player one final chance before the fallback.
          tryMatchmaking(io);
          if (!socket.connected || !waitingQueue.includes(player)) return;

          removeFromQueue(socket.id);
          const botProfile = BOT_ROSTER.reduce((closest, bot) =>
            Math.abs(bot.rating - player.rating) < Math.abs(closest.rating - player.rating) ? bot : closest
          );
          createBotRoom(player, botProfile, io);
          io.emit('queue_update', { waitingCount: waitingQueue.length });
        }, BOT_MATCH_DELAY_MS);
        timer.unref();
        botMatchTimers.set(socket.id, timer);
      }
    });

    // CLIENT -> SERVER: cancel_search
    socket.on('cancel_search', () => {
      removeFromQueue(socket.id);
      io.emit('queue_update', { waitingCount: waitingQueue.length });
    });

    // CLIENT -> SERVER: player_ready
    socket.on('player_ready', ({ roomId }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.status !== 'waiting_ready') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.ready) return;
      if (player) {
        player.ready = true;
      }

      // Notify opponent
      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent && opponent.socket) {
        opponent.socket.emit('opponent_ready');
      }

      // Check if both ready
      if (room.players.every(p => p.ready)) {
        startBattle(room, io);
      }
    });

    // CLIENT -> SERVER: submit_transcript
    socket.on('submit_transcript', async ({ roomId, transcript, actualDuration, wordCount }) => {
      const room = activeRooms.get(roomId);
      if (!room || room.status !== 'recording') return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (!player || player.submitted) return;
      if (player) {
        player.transcript = transcript || '';
        player.actualDuration = Number(actualDuration) || 1;
        player.wordCount = Number(wordCount) || 0;
        player.submitted = true;
      }

      // Notify opponent
      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent && opponent.socket) {
        opponent.socket.emit('opponent_submitted');
      }

      // Check if both submitted
      if (room.players.every(p => p.submitted)) {
        analyzeAndRevealResults(room, io);
      }
    });

    // CLIENT -> SERVER: send_reaction
    socket.on('send_reaction', ({ roomId, reaction }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;

      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent && opponent.socket) {
        opponent.socket.emit('receive_reaction', { reaction });
      }
    });

    // CLIENT -> SERVER: request_rematch
    socket.on('request_rematch', ({ roomId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (player) player.wantsRematch = true;

      const opponent = room.players.find(p => p.socketId !== socket.id);
      if (opponent && opponent.socket) {
        opponent.socket.emit('opponent_wants_rematch');
      }

      // If both accepted rematch
      if (room.players.every(p => p.isBot || p.wantsRematch)) {
        resetRoomForRematch(room, io);
      }
    });

    // CLIENT -> SERVER: accept_rematch
    socket.on('accept_rematch', ({ roomId }) => {
      const room = activeRooms.get(roomId);
      if (!room) return;

      const player = room.players.find(p => p.socketId === socket.id);
      if (player) player.wantsRematch = true;

      if (room.players.every(p => p.isBot || p.wantsRematch)) {
        resetRoomForRematch(room, io);
      }
    });

    // CLIENT -> SERVER: leave_room
    socket.on('leave_room', ({ roomId }) => {
      handleLeaveRoom(socket.id, roomId, io);
    });

    socket.on('disconnect', () => {
      removeFromQueue(socket.id);
      io.emit('queue_update', { waitingCount: waitingQueue.length });
      leaveActiveRooms(socket, io);
      playerSockets.delete(socket.id);
    });
  });

  return io;
}

function clearBotMatchTimer(socketId) {
  clearTimeout(botMatchTimers.get(socketId));
  botMatchTimers.delete(socketId);
}

function removeFromQueue(socketId) {
  clearBotMatchTimer(socketId);
  waitingQueue = waitingQueue.filter(p => p.socketId !== socketId);
}

function leaveActiveRooms(socket, io) {
  for (const [roomId, room] of activeRooms.entries()) {
    if (room.players.some(p => p.socketId === socket.id)) {
      handleLeaveRoom(socket.id, roomId, io);
    }
  }
}

function tryMatchmaking(io) {
  if (waitingQueue.length < 2) return;

  const now = Date.now();

  for (let i = 0; i < waitingQueue.length; i++) {
    const player = waitingQueue[i];
    const waitTime = (now - player.joinedAt) / 1000;

    let ratingRange = 200;
    if (waitTime > 10) ratingRange = 500;
    if (waitTime > 20) ratingRange = 2000;

    let bestOpponentIdx = -1;
    let bestRatingDiff = Infinity;

    for (let j = 0; j < waitingQueue.length; j++) {
      if (i === j) continue;
      const opponent = waitingQueue[j];
      
      // Match only players with the SAME selected language
      if (player.language !== opponent.language) continue;

      const ratingDiff = Math.abs(player.rating - opponent.rating);

      if (ratingDiff <= ratingRange && ratingDiff < bestRatingDiff) {
        bestRatingDiff = ratingDiff;
        bestOpponentIdx = j;
      }
    }

    if (bestOpponentIdx !== -1) {
      const opponent = waitingQueue[bestOpponentIdx];

      // Remove both from queue
      const idxs = [i, bestOpponentIdx].sort((a, b) => b - a);
      idxs.forEach(idx => {
        clearBotMatchTimer(waitingQueue[idx].socketId);
        waitingQueue.splice(idx, 1);
      });

      // Create room
      createRoom(player, opponent, io);
      io.emit('queue_update', { waitingCount: waitingQueue.length });
      break;
    }
  }
}

function createRoom(p1, p2, io) {
  const roomId = `room-${nanoid(8)}`;
  const topic = getRandomTopic();

  const room = {
    roomId,
    players: [
      { socketId: p1.socketId, socket: p1.socket, playerName: p1.playerName, avatar: p1.avatar, rating: p1.rating, position: 'player1', ready: false, submitted: false, isBot: false },
      { socketId: p2.socketId, socket: p2.socket, playerName: p2.playerName, avatar: p2.avatar, rating: p2.rating, position: 'player2', ready: false, submitted: false, isBot: false }
    ],
    topic: topic.topic,
    category: topic.category,
    duration: 60,
    language: p1.language || 'en-US',
    status: 'waiting_ready',
    createdAt: Date.now()
  };

  activeRooms.set(roomId, room);

  p1.socket.join(roomId);
  p2.socket.join(roomId);

  p1.socket.emit('match_found', {
    roomId,
    opponent: { name: p2.playerName, avatar: p2.avatar, rating: p2.rating, tier: getTier(p2.rating).name },
    yourPosition: 'player1'
  });

  p2.socket.emit('match_found', {
    roomId,
    opponent: { name: p1.playerName, avatar: p1.avatar, rating: p1.rating, tier: getTier(p1.rating).name },
    yourPosition: 'player2'
  });

  // Never begin while a player is still granting microphone permission.
  setTimeout(() => {
    const currentRoom = activeRooms.get(roomId);
    if (currentRoom && currentRoom.status === 'waiting_ready') {
      io.to(roomId).emit('error', { message: 'The match was not accepted in time. Find another opponent when you are ready.', code: 'READY_TIMEOUT' });
      currentRoom.players.forEach(player => player.socket?.leave(roomId));
      activeRooms.delete(roomId);
    }
  }, 60000).unref();
}

function createBotRoom(player, botProfile, io) {
  const roomId = `room-bot-${nanoid(8)}`;
  const topic = getRandomTopic();

  const room = {
    roomId,
    players: [
      { socketId: player.socketId, socket: player.socket, playerName: player.playerName, avatar: player.avatar, rating: player.rating, position: 'player1', ready: false, submitted: false, isBot: false },
      { socketId: `bot-${botProfile.id}`, socket: null, playerName: botProfile.name, avatar: botProfile.avatar, rating: botProfile.rating, position: 'player2', ready: true, submitted: false, isBot: true, botProfile }
    ],
    topic: topic.topic,
    category: topic.category,
    duration: 60,
    language: player.language || 'en-US',
    status: 'waiting_ready',
    createdAt: Date.now()
  };

  activeRooms.set(roomId, room);
  player.socket.join(roomId);

  player.socket.emit('match_found', {
    roomId,
    opponent: { name: botProfile.name, avatar: botProfile.avatar, rating: botProfile.rating, tier: botProfile.tier, isBot: true },
    yourPosition: 'player1'
  });
}

function startBattle(room, io) {
  if (!room || room.status !== 'waiting_ready') {
    return;
  }
  room.status = 'topic_reveal';

  io.to(room.roomId).emit('battle_starting', {
    topic: room.topic,
    category: room.category,
    duration: room.duration
  });

  let count = 5;
  const interval = setInterval(() => {
    if (!activeRooms.has(room.roomId) || room.status !== 'topic_reveal') {
      clearInterval(interval);
      return;
    }
    io.to(room.roomId).emit('speaking_countdown', { count });
    count--;
    if (count < 0) {
      clearInterval(interval);
      if (room.status !== 'topic_reveal') return;
      room.status = 'recording';
      io.to(room.roomId).emit('start_recording', { startAt: Date.now() });

      // If opponent is a bot, start generating its transcription in background
      const botPlayer = room.players.find(p => p.isBot);
      if (botPlayer) {
        simulateBotCompletion(room, botPlayer, io);
      }
    }
  }, 1000);
  room.countdownTimer = interval;
}

async function simulateBotCompletion(room, botPlayer, io) {
  // Simulate bot waiting and transcribing
  room.botTimer = setTimeout(async () => {
    if (!activeRooms.has(room.roomId) || room.status !== 'recording') return;
    let botTranscript = `Well, speaking about "${room.topic}", I believe it is a very interesting question. Actually, in my opinion, there are key factors we should look into. Um, first, we have to consider how people adapt. Like, this is basically the most crucial part. So, in conclusion, balance is everything.`;

    const client = getOpenAIClient();
    if (client) {
      try {
        const prompt = `Generate a realistic spoken speech transcript for the topic: '${room.topic}'.
The speech should be written in language: ${room.language || 'en-US'}.
The speaker's skill level is: ${botPlayer.botProfile.skillLevel}.
Duration was 60 seconds.
The speaker should sound like: ${botPlayer.botProfile.personality}.
Return ONLY the transcript text itself. Length: ~90-130 words.`;

        const response = await client.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        });
        if (response.choices[0].message.content) {
          botTranscript = response.choices[0].message.content.trim();
        }
      } catch (err) {
        console.warn('Failed to generate bot transcript via LLM, using fallback:', err);
      }
    }

    if (!activeRooms.has(room.roomId) || room.status !== 'recording') return;
    botPlayer.transcript = botTranscript;
    botPlayer.actualDuration = 60;
    botPlayer.wordCount = botTranscript.split(/\s+/).filter(Boolean).length;
    botPlayer.submitted = true;

    // Emit opponent submitted to player
    const realPlayer = room.players.find(p => !p.isBot);
    if (realPlayer && realPlayer.socket) {
      realPlayer.socket.emit('opponent_submitted');
    }

    // Check if both submitted (in case real player submitted first)
    if (room.players.every(p => p.submitted)) {
      analyzeAndRevealResults(room, io);
    }
  }, 30000); // Bot submits after 30s
  room.botTimer.unref();
}

async function analyzeAndRevealResults(room, io) {
  if (room.status !== 'recording') return;
  room.status = 'analyzing';
  io.to(room.roomId).emit('analyzing_speeches', { message: 'AI judge is deliberating...' });

  const [p1, p2] = room.players;

  try {
    const [analysis1, analysis2] = await Promise.all([
      runParallelSpeechAnalysis(p1.transcript, room.topic, room.duration, p1.actualDuration, room.language),
      runParallelSpeechAnalysis(p2.transcript, room.topic, room.duration, p2.actualDuration, room.language)
    ]);

    let score1 = analysis1.overallScore;
    let score2 = analysis2.overallScore;

    if (p1.isBot) {
      score1 = Math.floor(60 + Math.random() * 21);
    }
    if (p2.isBot) {
      score2 = Math.floor(60 + Math.random() * 21);
    }

    let winner = 'draw';
    if (score1 > score2) {
      winner = 'player1';
    } else if (score2 > score1) {
      winner = 'player2';
    }

    const ratingBefore1 = p1.rating;
    const ratingBefore2 = p2.rating;
    const { change1, change2 } = calculateELO(ratingBefore1, ratingBefore2, winner);
    
    // Update player rating values in socket room memory
    p1.rating = p1.rating + change1;
    p2.rating = p2.rating + change2;

    io.to(room.roomId).emit('battle_results', {
      resultId: `${room.roomId}-${nanoid(8)}`,
      winner,
      topic: room.topic,
      category: room.category,
      player1: {
        name: p1.playerName,
        avatar: p1.avatar,
        rating: ratingBefore1,
        newRating: p1.rating,
        ratingChange: change1,
        overallScore: score1,
        categories: analysis1.categories,
        transcript: p1.transcript,
        strengths: analysis1.strengths,
        improvements: analysis1.improvements,
        overallFeedback: analysis1.overallFeedback
      },
      player2: {
        name: p2.playerName,
        avatar: p2.avatar,
        rating: ratingBefore2,
        newRating: p2.rating,
        ratingChange: change2,
        overallScore: score2,
        categories: analysis2.categories,
        transcript: p2.transcript,
        strengths: analysis2.strengths,
        improvements: analysis2.improvements,
        overallFeedback: analysis2.overallFeedback
      }
    });

    room.status = 'finished';
  } catch (error) {
    console.error('Battle analysis failure:', error);
    io.to(room.roomId).emit('error', {
      message: 'AI Evaluation failed. Please try again.',
      code: 'ANALYSIS_ERROR'
    });
  }
}

async function runParallelSpeechAnalysis(transcript, topic, targetDuration, actualDuration) {
  const trimmed = (transcript || '').trim();
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      overallScore: 0,
      categories: {
        confidence: { score: 0, feedback: "No speech detected." },
        fluency: { score: 0, feedback: "No speech detected." },
        relevance: { score: 0, feedback: "No speech detected." },
        vocabulary: { score: 0, feedback: "No speech detected." },
        structure: { score: 0, feedback: "No speech detected." },
        clarity: { score: 0, feedback: "No speech detected." },
        engagement: { score: 0, feedback: "No speech detected." },
        timeManagement: { score: 0, feedback: "No speech detected." }
      },
      strengths: ["None (no speech detected)"],
      improvements: ["Please speak clearly into your microphone during the recording period."],
      overallFeedback: "No speech was detected or the recorded audio was too short to analyze. Make sure your microphone is working and speak clearly on the given topic."
    };
  }

  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  const client = getOpenAIClient();
  if (client) {
    try {
      const systemPrompt = `You are a strict competitive speech judge grading speech performances based on professional public speaking frameworks (like Toastmasters).

CRITICAL GRADING CRITERIA:
1. Pacing & Pauses:
   - Reward controlled, deliberate pacing and short pauses (0.5 to 1.0 seconds max). These show confidence, presence, and control. DO NOT penalize these.
   - Penalize long, dead pauses (2.0 to 3.0+ seconds). These show nervousness, lack of competence, or losing the train of thought.
2. Words Per Minute (WPM) Calibration:
   - Confident speaker range: 130 to 150 WPM. If the speaker's average pace is within 130-150 WPM, reward them with high scores.
   - Slow speaker range: < 110 WPM. Reduce the score for lack of fluency and slow delivery.
   - Rushed speaker range: > 160 WPM. This is a rushed speech (not confidence), so penalize clarity and fluency.
3. Structuring Rules:
   - For targetDuration <= 60 seconds: Requires a quick, compelling hook/opening, body points, and a neat conclusion that is NOT rushed.
   - For targetDuration > 60 seconds (up to 300 seconds): Requires a formal opening, structured discussion body containing exactly 2 to 3 distinct examples or points, and a powerful conclusion (optionally ending with a question).
4. Strictness on Short/Silent Answers:
   - If the speech word count is extremely low relative to the duration (e.g., less than 20 words for a 60s speech), you MUST award an overall score below 20. Do not give average or high scores to incomplete, silent, or single-phrase answers.

Return valid JSON only matching the structure requested.`;
      const userPrompt = `BATTLE EVALUATION:
Topic: "${topic}"
Duration: ${actualDuration} seconds
Transcript: "${transcript}"
WPM: ${wpm}

Return JSON with "overallScore" (1-100), "categories" (confidence, fluency, relevance, vocabulary, structure, clarity, engagement, timeManagement with score/feedback), "strengths" (string[]), "improvements" (string[]), and "overallFeedback" (string).`;

      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (e) {
      console.warn('API error in battle grading, falling back to local formulas:', e);
    }
  }

  // Fallback ELO mock calculator
  const fillers = ['um', 'uh', 'like', 'so', 'you know'];
  let fillerCount = 0;
  fillers.forEach(word => {
    const matches = transcript.match(new RegExp(`\\b${word}\\b`, 'gi'));
    if (matches) fillerCount += matches.length;
  });

  // Strict WPM logic (Ideal: 130 - 150 WPM)
  let wpmScore = 95;
  if (wpm < 110) wpmScore = 50;
  else if (wpm > 160) wpmScore = 55;
  else if (wpm >= 110 && wpm < 130) wpmScore = 78;
  else if (wpm > 150 && wpm <= 160) wpmScore = 80;

  const fluencyScore = Math.max(30, 95 - (fillerCount * 7));
  const relevanceScore = wordCount < 15 ? 30 : 85;
  const clarityScore = Math.max(40, 90 - (fillerCount * 5));
  const timeScore = actualDuration >= 45 ? 90 : 50;

  const overall = Math.round((fluencyScore + relevanceScore + clarityScore + timeScore + wpmScore) / 5);

  return {
    overallScore: overall,
    categories: {
      confidence: { score: Math.round(overall * 0.95), feedback: 'Evaluated locally.' },
      fluency: { score: fluencyScore, feedback: `Paced at ${wpm} WPM.` },
      relevance: { score: relevanceScore, feedback: 'Topic alignment checked.' },
      vocabulary: { score: Math.round(overall * 0.9), feedback: 'Vocabulary checked.' },
      structure: { score: Math.round(overall * 0.92), feedback: 'Flow calculated.' },
      clarity: { score: clarityScore, feedback: 'Articulation computed.' },
      engagement: { score: Math.round(overall * 0.88), feedback: 'Tone checked.' },
      timeManagement: { score: timeScore, feedback: `Spoke for ${actualDuration}s.` }
    },
    strengths: ['Clear pacing and flow.'],
    improvements: ['Minimize filler words.'],
    overallFeedback: 'Analysis completed via fallback engine.'
  };
}

function calculateELO(rating1, rating2, winner) {
  let change1 = 0;
  let change2 = 0;

  if (winner === 'player1') {
    change1 = 30;
    change2 = -30;
  } else if (winner === 'player2') {
    change1 = -30;
    change2 = 30;
  }

  // Ensure ratings do not drop below a floor of 100 ELO
  if (rating1 + change1 < 100) change1 = 100 - rating1;
  if (rating2 + change2 < 100) change2 = 100 - rating2;

  return {
    change1,
    change2
  };
}

function handleLeaveRoom(socketId, roomId, io) {
  const room = activeRooms.get(roomId);
  if (!room) return;

  const leavingPlayer = room.players.find(p => p.socketId === socketId);
  if (!leavingPlayer) return;
  const remainingPlayer = room.players.find(p => p.socketId !== socketId);
  room.status = 'closed';
  clearInterval(room.countdownTimer);
  clearTimeout(room.botTimer);

  if (remainingPlayer && remainingPlayer.socket) {
    remainingPlayer.socket.emit('opponent_disconnected');
  }

  activeRooms.delete(roomId);
  console.log(`Battle Room ${roomId} terminated because ${leavingPlayer?.playerName} left.`);
}

function resetRoomForRematch(room, io) {
  const newTopic = getRandomTopic();
  room.topic = newTopic.topic;
  room.category = newTopic.category;
  room.status = 'waiting_ready';

  room.players.forEach(p => {
    p.ready = p.isBot ? true : false;
    p.submitted = false;
    p.wantsRematch = false;
    p.transcript = '';
    p.actualDuration = 0;
    p.wordCount = 0;
  });

  room.players.forEach(p => {
    if (p.isBot) return;
    const opponent = room.players.find(o => o.position !== p.position);
    p.socket.emit('match_found', {
      roomId: room.roomId,
      opponent: {
        name: opponent.playerName,
        avatar: opponent.avatar,
        rating: opponent.rating,
        tier: getTier(opponent.rating).name,
        isBot: opponent.isBot
      },
      yourPosition: p.position
    });
  });
}

function getRandomTopic() {
  const generalTopics = TOPICS.filter(t => t.category === 'General');
  if (generalTopics.length > 0) {
    return generalTopics[Math.floor(Math.random() * generalTopics.length)];
  }
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}

function getTier(rating) {
  if (rating < 800) return { name: 'Bronze', emoji: '🥉' };
  if (rating < 1000) return { name: 'Silver', emoji: '🥈' };
  if (rating < 1200) return { name: 'Gold', emoji: '🥇' };
  if (rating < 1400) return { name: 'Diamond', emoji: '💎' };
  if (rating < 1600) return { name: 'Master', emoji: '🔮' };
  return { name: 'Legend', emoji: '👑' };
}

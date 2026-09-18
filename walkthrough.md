# SpeakSpin Architecture Walkthrough

This document breaks down the internal mechanics of the **SpeakSpin** codebase, explaining how the backend, frontend, database schemas, speech scoring heuristics, and matchmaking logic interact from start to finish.

---

## 1. High-Level Overview

**SpeakSpin** is a real-time public speaking evaluation platform where users practice impromptu speech sessions under single-player or 1v1 battle mode conditions. The application transcribes user speech using the browser's Web Speech API (with Whisper API fallbacks) and grades speech metrics—such as grammatical coherence, filler word counts, vocabulary density, structures, and pacing—using an LLM evaluator (Groq Llama). 

* **The Problem**: Public speaking is stressful and lacks immediate, actionable feedback.
* **The Solution**: SpeakSpin gamifies impromptu speaking with spin wheels, real-time timers, comparative ELO scores, competitive multiplayer queues, and comprehensive critiques with native language speech exemplars.

```
       +---------------------------------------------+
       |             React Frontend Client           |
       |  (Montserrat / High-Contrast Brutalist UI)  |
       +-------+-----------------------------+-------+
               |                             |
  HTTPS / REST |                             | WebSockets
  API Requests |                             | (matchmaking, reactions, duels)
               v                             v
       +-------+-----------------------------+-------+
       |               Node.js Backend               |
       |     (Express Servers & Socket.io Queue)     |
       +-------+-----------------------------+-------+
               |                             |
   SQL Queries |                             | API Prompts
               v                             v
       +-------+-------+             +-------+-------+
       |  PostgreSQL   |             |  Groq Llama   |
       |   Database    |             |  OpenAI/LLM   |
       +---------------+             +---------------+
```

---

## 2. Chronological Execution Flow (The "Story" of the Code)

### Phase 1: Bootstrapping & Setup
1. **Server Initialization**: 
   When the backend starts, [server.js](file:///c:/MRIDUL/Code/Speakspin/backend/server.js) executes first. It loads environment variables (`.env`), connects to the PostgreSQL database using Sequelize/PG via [config/db.js](file:///c:/MRIDUL/Code/Speakspin/backend/config/db.js), mounts Express REST routers, wrapper-binds an HTTP server, and boots the socket gateway in [socket.js](file:///c:/MRIDUL/Code/Speakspin/backend/socket.js).
2. **Client Load**: 
   The React frontend bootstraps from [main.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/main.jsx) and renders [App.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.jsx). It loads global CSS styles and establishes state structures tracking screen progression.

### Phase 2: Single Player Session
1. **Config Selection**: 
   The user arrives at the Landing screen and selects a mode. Clicking "Solo Mode" renders the `TimerSelector`, where they pick a duration (30s, 1m, 2m, 5m), language locale, and category domain.
2. **The Spinning Wheel**: 
   Upon submitting their configuration, the screen switches to `SpinWheel.jsx`. Clicking the canvas spins a 10-segment canvas wheel generated randomly from subtopics matching the chosen category.
3. **Recording Speech**:
   Once a subtopic is chosen, the user is redirected to `SpeechRecorder.jsx`. The browser's Web Speech API (`webkitSpeechRecognition`) initializes, displaying live text transcripts. Since copy-pasting is restricted via `readOnly={true}`, inputs are strictly mic-based.
4. **Grading & Analysis**:
   When the timer expires, the recorded audio is converted to a text transcript. The client issues a `POST /api/analyze` request. The backend LLM parses transcript structures, filler counts, vocabulary markers, and control pauses, storing findings in the database.
5. **Critique Dashboard & History Logs**:
   The response renders the `FeedbackDashboard.jsx` scoring dashboard. The metrics are simultaneously written to the PostgreSQL database so the user can review granular breakdown details later on the `ProgressHistory.jsx` screen.

### Phase 3: Real-Time Battle Mode (Multiplayer)
1. **Matchmaking Queue**:
   Entering "Battle Mode" renders the High-Contrast Brutalist `BattleLobby.jsx` component. Clicking "INITIATE MATCHMAKING" connects to socket listeners via `find_match`. The server places players in a language-segregated queue (`waitingQueue`).
2. **Queue Matching & Bot Fallback**:
   The server attempts to match players of identical languages within rating brackets (starting at ±200 ELO, expanding automatically over time). If 30 seconds pass without a match, a "Duel Bot" panel appears.
3. **Versus Ready-Check & Reveal**:
   When a match completes, `match_found` fires. Both players view competitor ELO ratings. Once both check in, the server selects a shared random topic.
4. **Synchronized Battle Recording**:
   Both players speak concurrently on the same topic inside `BattleRecorder.jsx`. When finished, transcripts are submitted via `submit_transcript`.
5. **AI Judging & ELO Adjustment**:
   The socket server coordinates a parallel OpenAI/Groq judge prompt comparing both transcripts. It decides the winner, computes ELO rating gains/losses (using a standard K-factor of 32), updates history tables, and streams reaction signals.

---

## 3. Component & Function-by-Function Breakdown

### Backend Core Gateway ([backend/server.js](file:///c:/MRIDUL/Code/Speakspin/backend/server.js))
* **`app.get('/', ...)`**: 
  * *Description*: Default welcome endpoint returning gateway status metadata. Prevents raw Express `Cannot GET /` errors.
  * *Inputs*: Express request (`req`).
  * *Outputs*: Returns a JSON payload showing status, uptime, and gateway version.
* **`app.get('/health', ...)`**: 
  * *Description*: Health check routing endpoint checking deployment status.
  * *Inputs*: Request parameters.
  * *Outputs*: Returns `{ status: "ok" }`.

### Socket Management ([backend/socket.js](file:///c:/MRIDUL/Code/Speakspin/backend/socket.js))
* **`initSocket(httpServer)`**: 
  * *Description*: Boots the Socket.io server layer and registers real-time matching handlers.
  * *Inputs*: Wrapped HTTP server instance.
  * *Outputs*: Void.
* **`tryMatchmaking(io)`**: 
  * *Description*: Iterates over the queue array to pair online players selecting matching language constraints.
  * *Inputs*: Socket.io emitter instance.
  * *Outputs*: Void.
* **`spawnBotBattle(socket, botChoice, language)`**: 
  * *Description*: Provisions a simulated bot opponent using specific personality parameters if matchmaking times out.
  * *Inputs*: Current client socket, selected bot config object, language locale.
  * *Outputs*: Void.
* **`analyzeAndRevealResults(room, io)`**: 
  * *Description*: Requests real-time evaluation comparing both players' transcripts. Mutates rating database rows.
  * *Inputs*: Room metadata object.
  * *Outputs*: Emits `battle_results` packet.

### Frontend Controller ([frontend/src/App.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.jsx))
* **`navigateTo(screen)`**: 
  * *Description*: Updates states to route component views cleanly.
  * *Inputs*: Target screen enum key.
  * *Outputs*: Void.
* **`handleStartBattleMode()`**: 
  * *Description*: Establishes socket connection handlers for real-time matches.
  * *Inputs*: None.
  * *Outputs*: Void.

---

## 4. Connecting the Dots (The Big Picture)

1. **State Synced Components**: 
   Component interactions rely on shared variables passed down from [App.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.jsx). For example, `selectedCategory` and `selectedDuration` are defined in `TimerSelector`, utilized in `SpinWheel` to generate sectors, and passed into `SpeechRecorder` to enforce recording durations.
2. **REST & Socket Unified Lifecycle**: 
   Single-player endpoints run asynchronously via standard HTTP fetch wrappers inside [utils/api.js](file:///c:/MRIDUL/Code/Speakspin/frontend/src/utils/api.js). Battle mode runs over persistent TCP sockets to achieve real-time synchronization. Both loops terminate at the same LLM judge gateway (Groq/OpenAI Llama models) and log records in a shared PostgreSQL store.
3. **Aesthetic Consistency**:
   The entire application enforces high-contrast, black-and-white flat brutalist borders and offset offset-shadow card blocks, utilizing `Montserrat` typography to maintain a premium gaming identity.

---

## 5. Battle Premature Auto-Submission Resolution

### The Symptom
When starting a 1v1 battle, the player's speech was immediately submitted with 0 seconds duration, an empty transcript, and a score of 0, transitioning directly to the waiting/analyzing screen without giving the user time to speak.

### Root Causes
1. **Unmount-Triggered Submission in `BattleRecorder.jsx`**:
   The component's unmount cleanup previously invoked `stopRecordingSession()`, which treated missing/inactive MediaRecorder instances as an automatic speech completion, firing `handleAutoSubmit(null)` and emitting `submit_transcript` with 0 words on any fast remount (such as React StrictMode or socket state re-renders).
2. **Duplicate `startBattle` Invocations in `backend/socket.js`**:
   `player_ready` lacked room state guards, allowing the battle countdown (`speaking_countdown`) and `start_recording` events to be emitted multiple times concurrently. This caused `BattleRecorder` in the client to mount, unmount, and immediately submit.
3. **Async `getUserMedia` Blocking Countdown Timers**:
   `startRecordingSession()` was awaiting `navigator.mediaDevices.getUserMedia` before starting `setInterval()`. If microphone hardware took time to prompt or initialize, the countdown timer was blocked from ticking.
4. **Vite Watch Polling in WSL**:
   Vite in WSL was not picking up Windows-side file edits because `usePolling: true` was missing, causing stale ES modules to be served until forcibly reloaded.

### Key Changes
- **[BattleRecorder.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/components/multiplayer/BattleRecorder.jsx)**:
  - Immediate, synchronous countdown timer on mount defaulting safely to `Number(duration) || 60`.
  - Background asynchronous acquisition of microphone streams and MediaRecorder without blocking UI timers.
  - Component unmount cleanup strictly clears timers and stops tracks—it never submits speech.
- **[socket.js](file:///c:/MRIDUL/Code/Speakspin/backend/socket.js)**:
  - Guarded `startBattle()` with `if (!room || room.status !== 'waiting_ready') return;`.
  - Guarded `start_recording` transition with `if (room.status !== 'topic_reveal') return;`.
- **[OpponentFound.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/components/multiplayer/OpponentFound.jsx)**:
  - Guarded `handleReady` with `hasSentReadyRef` to prevent double readiness events.
- **[vite.config.js](file:///c:/MRIDUL/Code/Speakspin/frontend/vite.config.js)**:
  - Configured `server.watch.usePolling = true` with a 100ms interval for reliable file syncing across Windows/WSL.

### Verification Results
1. **Matchmaking**: Shadow-bot matches automatically within 4s.
2. **Opponent Reveal**: Countdown and ready triggers fire exactly once.
3. **Topic Countdown**: 5s reveal countdown ticks smoothly to 0.
4. **Battle Recorder**: Full 60s recording countdown ticks down (60s -> 51s -> 38s...) without premature auto-submission.
5. **Speech Submission**: Submission occurs only upon timer expiration or when the user explicitly clicks "SUBMIT EARLY".
---

## 6. PostgreSQL WSL IPv6 Resolution & Graceful Degradation

### The Symptom
Running `nodemon server.js` in WSL resulted in:
`AggregateError [ETIMEDOUT]` and `Error: connect ENETUNREACH 2600:1f16:1c2b:...:5432 - Local (:::0)`, causing nodemon to repeatedly crash.

### Root Cause
1. **Node 20+ Happy Eyeballs in WSL2**: Node's built-in `autoSelectFamily` and DNS lookup prioritized IPv6 addresses returned by Neon's AWS DNS names. Because WSL2 environments typically do not have outbound IPv6 routing configured through the Windows host, the connection attempts failed with `ENETUNREACH`, causing `AggregateError [ETIMEDOUT]`.
2. **Fatal Exit**: `connectDB()` had a hardcoded `process.exit(1)`, crashing the entire Express/Socket.io gateway when the database had a connection timeout.

### Resolution
- In **[db.js](file:///c:/MRIDUL/Code/Speakspin/backend/config/db.js)**:
  - Enforced `dns.setDefaultResultOrder('ipv4first')` and `net.setDefaultAutoSelectFamily(false)`.
  - Added custom IPv4 DNS lookup to `pg.Pool` (`lookup: (hostname, options, cb) => dns.lookup(hostname, { family: 4, all: false }, cb)`).
  - Replaced `process.exit(1)` with a warning log so that Multiplayer Battle Mode, Solo Practice, and AI analysis remain fully online and resilient even if the database is temporarily unreachable.
- Added **[nodemon.json](file:///c:/MRIDUL/Code/Speakspin/backend/nodemon.json)** with `legacyWatch: true` for polling file changes across Windows/WSL boundaries.

---

## 7. WebSocket Host Binding & CORS Gateway Resolution

### The Symptom
The frontend browser console reported:
`WebSocket connection to 'ws://localhost:3001/socket.io/?EIO=4&transport=websocket' failed:`

### Root Causes
1. **IPv6-Only Listener on WSL**:
   `httpServer.listen(PORT)` in Node.js on Linux defaults to IPv6 `::1`. In WSL2, `wslrelay.exe` forwards this only to Windows `[::1]:3001`, leaving `127.0.0.1:3001` unmapped. When the browser or frontend attempted to connect via IPv4 loopback (`127.0.0.1` or `localhost`), connection attempts were refused.
2. **Strict Origin Match in Socket.io CORS**:
   `backend/socket.js` only whitelisted `http://localhost:5173`. When Vite ran on another port (e.g. `5174`) or when the browser accessed `http://127.0.0.1:5173`, CORS rejected the WebSocket handshake.
3. **Missing Polling Fallback**:
   `frontend/src/hooks/useSocket.js` had `transports: ['websocket']` hardcoded without fallback to polling.

### Resolution
- **[server.js](file:///c:/MRIDUL/Code/Speakspin/backend/server.js)**:
  - Explicitly bound server to `0.0.0.0` (`httpServer.listen(PORT, '0.0.0.0', ...)`), ensuring both `127.0.0.1:3001` and `localhost:3001` receive connections.
  - Updated CORS validator to permit all `localhost:` and `127.0.0.1:` dev ports.
- **[socket.js](file:///c:/MRIDUL/Code/Speakspin/backend/socket.js)**:
  - Updated Socket.IO CORS configuration to accept any localhost / 127.0.0.1 port.
- **[useSocket.js](file:///c:/MRIDUL/Code/Speakspin/frontend/src/hooks/useSocket.js)**:
  - Enabled `transports: ['websocket', 'polling']` with auto-reconnection.

---

## 8. Google Sign-In Top-Right Integration & Origin Validation

### Overview
Integrated a persistent "Sign in with Google" button in the top-right header corner of the app, allowing users in Guest Mode to authenticate and sync their history and ratings.

### Changes Implemented
1. **Top Header Bar ([App.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.jsx))**:
   - Added persistent header bar visible on all navigation and dashboard screens (`LANDING`, `SETUP`, `FEEDBACK`, `HISTORY`, `BATTLE_LOBBY`, `BATTLE_RESULTS`, `BATTLE_PROFILE`), while gracefully hiding during active speech recording to avoid distraction.
   - For **Guest Users**: Shows guest indicator (`🦁 PLAYING AS SPEAKER_XXXX`) on the left and the official `<GoogleLogin>` button in the top-right corner.
   - For **Authenticated Users**: Shows user profile picture, name, and a "LOG OUT" button.
   - Enhanced `handleSignOut` to cleanly revert to guest mode without breaking the view.
2. **Brutalist Theme Styling ([App.css](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.css))**:
   - Added `.google-signin-top-right` with high-contrast 2px solid white borders and 3px brutalist box-shadows.
3. **Localhost Origin Verification**:
   - Verified that `http://localhost:5173` in Google Cloud Console's "Authorized JavaScript origins" works directly with the Google OAuth Client ID (`415823888328-vt1htjut9g5287t15tn7gagf4msed4mb.apps.googleusercontent.com`).
   - Verified end-to-end popup launch connecting to `accounts.google.com` using Playwright.

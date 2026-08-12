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

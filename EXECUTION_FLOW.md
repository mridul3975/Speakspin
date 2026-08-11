# System Execution Map (EXECUTION_FLOW.md)

This map outlines the active entry points, execution flows, and dependency chains of both the frontend React client and the backend Node server.

---

## Recent Logic Changes

* **React Stale Closure Fix (Battle Mode)**: Introduced `actualDurationRef` (a React ref) to track elapsed recording seconds in `BattleRecorder.jsx`. Previously, using the stale state closure variable `actualDuration` caused the duration check to evaluate to `0 >= 2`, skipping Whisper API uploads and defaulting to blank Web Speech logs.
* **Dynamic Upload Container Extensions**: Updated `transcribeAudio` inside `frontend/src/utils/api.js` to assign file extensions dynamically based on `audioBlob.type` (`.mp4` for iOS/Safari, `.webm` for Android/Chrome) instead of hardcoding `.webm`. This ensures Groq Whisper decodes the binaries correctly without throwing invalid media 500 errors.
* **Reference Fix**: Added `onStartBattle` to destructuring list inside `LandingScreen.jsx` to resolve runtime crash.
* **Competitive ELO Matchmaking Arena**: Implemented Socket.io client/server matching rooms. Supports real-time ratings, ELO math formulas ($K$-factor 32), and dynamic bot matches driven by AI script generators.
* **Web Audio API Sound Engine**: Integrated synthesizers for Horn sounds, ticking clocks, and winning arpeggios.

---

## 🚀 Entry Points

### 1. Frontend Client
* **File**: [frontend/src/main.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/main.jsx)
* **Start Line**: Line 7 (`ReactDOM.createRoot(document.getElementById('root')).render(...)`)

### 2. Backend Server
* **File**: [backend/server.js](file:///c:/MRIDUL/Code/Speakspin/backend/server.js)
* **Start Line**: Line 47 (`httpServer.listen(...)` binding Express and Socket.io)

---

## 🔄 Matchmaking & Battle Loop

1. **Lobby Initialization**:
   - The user opens "Battle Mode". `handleStartBattleMode()` in `App.jsx` starts the socket client connection and displays the `BattleLobby`.
2. **Find Match**:
   - The client emits `find_match` with avatar parameters and rating points (default 1000 ELO).
   - The server pushes the player onto the `waitingQueue` and starts matching rules.
3. **Queue Progression**:
   - Matches players within ±200 first, expanding limits automatically up to ±2000.
   - If 30 seconds elapse without matching, the server/client presents a "Duel Bot" panel.
4. **Ready Check**:
   - Once matched, the server emits `match_found`. Both clients view versus stats and have 10 seconds to click ready.
5. **Cinema Reveal**:
   - When both players are ready, the server selects a random Toastmasters topic and triggers `battle_starting` to kick off typewriter animations and sound alarms.
6. **Duel Recording**:
   - Both clients begin recording simultaneously.
   - If mic access is locked locally, users type transcripts manually into the `<textarea>` fallback.
7. **Score Evaluation**:
   - Transcripts are submitted to the server. The server runs parallel evaluations via `Promise.all` using GPT-4o.
   - The server computes ELO changes and broadcasts `battle_results` to declare the winner and prompt rematch choices.

---

## 📊 Dependency Chain

```
[App.jsx] (Sets useSocket Hook)
   │
   ├──> [LandingScreen] (⚔️ Battle Mode Button)
   │
   ├──> [BattleLobby]
   │       └──> [AvatarSelector] & [RatingBadge]
   │
   ├──> [Matchmaking] (Stopwatch & Radar)
   │
   ├──> [OpponentFound] (10s Countdown ready check)
   │
   ├──> [TopicReveal] (3-2-1 countdown beep triggers)
   │
   ├──> [BattleRecorder] (Dual microphone meter levels)
   │
   ├──> [BattleAnalyzing] (Intermission commentary)
   │
   └──> [BattleResults] (ELO animations & Floating reaction stream)
```

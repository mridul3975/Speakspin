# System Execution Map (EXECUTION_FLOW.md)

This map outlines the active entry points, execution flows, and dependency chains of both the frontend React client and the backend Node server.

---

## Recent Logic Changes

* **Local Matchmaking Test Helper**: Converted the static multiplayer transcript container to an interactive, editable `<textarea>`. This enables manual text entry in the second browser tab when the microphone hardware is locked during local testing, avoiding empty uploads and Groq API 500 crashes.
* **Singleton State Guard**: Added an `isStartedRef` flag in the `useSpeechRecognition` hook to prevent race conditions during double-mounting and hot reloads.

---

## 🚀 Entry Points

### 1. Frontend Client
* **File**: [frontend/src/main.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/main.jsx)
* **Start Line**: Line 7 (`ReactDOM.createRoot(document.getElementById('root')).render(...)`)

### 2. Backend Server
* **File**: [backend/server.js](file:///c:/MRIDUL/Code/Speakspin/backend/server.js)
* **Start Line**: Line 47 (`server.listen(...)` binding HTTP and WebSockets)

---

## 🔄 Execution Order

### Matchmaking & Speaking Battle Loop
1. **Lobby Join**: The user clicks "Multiplayer Battle" on the landing page, triggering `startMultiplayer()` inside [App.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/App.jsx). This initializes the Socket connection and switches to `SCREENS.LOBBY`.
2. **Match Registration**: [MultiplayerLobby.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/components/MultiplayerLobby.jsx) emits a `joinLobby` event with the user's name and ID.
3. **Room Allocation**:
   - The backend socket server ([socket.js](file:///c:/MRIDUL/Code/Speakspin/backend/socket.js)) checks for an opponent.
   - If found, it pairs both sockets, creates a unique `roomId`, pulls a random topic, and emits `matchFound` back to both clients.
4. **Synchronized Battle Countdown**:
   - Both clients receive the `matchFound` trigger, navigate to `SCREENS.BATTLE`, and start a simultaneous 3-second countdown on [MultiplayerBattle.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/components/MultiplayerBattle.jsx).
5. **Speech Recording & Fallbacks**:
   - When the countdown finishes, players speak.
   - If the microphone hardware is locked (during local tests), the user types into the interactive `<textarea>` instead.
   - When the 60s timer runs out, the client automatically stops recording.
6. **Automatic Scoring & Comparison**:
   - The client uploads valid audio to the backend `/api/transcribe` route for Whisper processing, falling back to the typed/Speech API transcript if empty.
   - The client calculates scores and emits `submitScore` to the server.
   - When both players submit, the server compares results, defines the winner, and pushes `battleFinished` to declare the winner on [BattleResult.jsx](file:///c:/MRIDUL/Code/Speakspin/frontend/src/components/BattleResult.jsx).

---

## 📊 Dependency Chain

```
[App.jsx] (Sets Socket.io Client)
   │
   ├──> [MultiplayerLobby.jsx]
   │       └──> Socket emit 'joinLobby'
   │
   ├──> [MultiplayerBattle.jsx]
   │       ├──> useSpeechRecognition.js
   │       ├──> useAudioLevel.js
   │       ├──> api.js (calls backend /api/transcribe)
   │       └──> Socket emit 'submitScore'
   │
   └──> [BattleResult.jsx]
```

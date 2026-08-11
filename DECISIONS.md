# Architectural Decision Log (DECISIONS.md)

This log tracks key architectural choices, logic changes, and workflow designs implemented in SpeakSpin.

---

### Date/Time: 2026-08-10T17:28:00Z
* **The Decision**: Corrected grid property naming from `grid-template-cols` to standard `grid-template-columns` in `App.css`.
* **The 'Why'**: Browsers were ignoring the invalid shorthand `cols`, causing all desktop grids (landing deck, time slots, stats cards) to fall back to a single vertical stacked layout.
* **Impact**: Restored standard horizontal desktop and grid layout formatting across all application screens.

---

### Date/Time: 2026-08-10T18:23:00Z
* **The Decision**: Automated Whisper speech transcription and analytical submission triggers.
* **The 'Why'**: To streamline user onboarding and experience by removing redundant "Transcribe" and "Analyze" manual button presses after a recording completes.
* **Impact**: The application automatically sends recorded voice blobs to Whisper and routes straight to the coach evaluation dashboard.

---

### Date/Time: 2026-08-10T18:27:30Z
* **The Decision**: Removed `setUser(null)` state reset from the `finally` block in `App.jsx`.
* **The 'Why'**: It was overwriting the valid authenticated state immediately after sign-in, forcing the app back to the login screen until a manual refresh occurred.
* **Impact**: Google Authentication session updates now persist immediately upon login validation.

---

### Date/Time: 2026-08-10T18:57:00Z
* **The Decision**: Created a real-time multiplayer dueling system using WebSockets (Socket.io / socket.io-client).
* **The 'Why'**: To implement a competitive lobby environment where two speakers can join rooms, speak on the same topic, and battle scores.
* **Impact**: Introduced `MultiplayerLobby.jsx`, `MultiplayerBattle.jsx`, and `BattleResult.jsx` matching paths inside the client-side router deck.

---

### Date/Time: 2026-08-11T04:40:00Z
* **The Decision**: Added `isStartedRef` and `abort()` controls inside `useSpeechRecognition.js`.
* **The 'Why'**: To prevent browsers from double-binding `start()` calls and causing `InvalidStateError` crashes when components double-mount or hot-reload.
* **Impact**: Ensures proper singleton resource allocation of the global browser Speech Recognition instance.

---

### Date/Time: 2026-08-11T05:43:00Z
* **The Decision**: Converted static multiplayer transcript box to an interactive, editable `<textarea>`.
* **The 'Why'**: Allows developers testing multiplayer locally to type mock text in the second window (where Chrome locks the active microphone/speech engine), avoiding silent uploads and Groq 500 errors.
* **Impact**: Ensures local end-to-end matchmaking and scoring tests work seamlessly.

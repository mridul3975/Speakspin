# Architectural Decision Log (DECISIONS.md)

This log tracks key architectural choices, logic changes, and workflow designs implemented in SpeakSpin.

---

### Date/Time: 2026-08-11T06:40:00Z
* **The Decision**: Added ELO-based Skill Matchmaking Algorithm with expanding search thresholds (±200 rating points first, ±500 at 10s, match anyone at 20s, and bot match at 30s).
* **The 'Why'**: To implement competitive matchmaking that keeps wait times low by gracefully relaxing ELO requirements as wait times increase, offering high-fidelity bots as a failsafe.
* **Impact**: Managed inside server-side memory structures in `backend/socket.js`.

---

### Date/Time: 2026-08-11T06:41:00Z
* **The Decision**: Implemented Web Audio API sound synthesizers in `frontend/src/utils/battleAudio.js`.
* **The 'Why'**: To avoid loading heavy MP3 asset dependencies and bypass cross-origin browser media loading blocks while building an immersive retro-gaming atmosphere.
* **Impact**: Generates ticks, Horn signals, and ELO level chimes dynamically on the client side.

---

### Date/Time: 2026-08-11T06:43:00Z
* **The Decision**: Integrated parallel GPT-4o Toastmasters speech graders on the backend.
* **The 'Why'**: To evaluate both contestants concurrently without blocking and calculate ELO changes using expected probability ratios.
* **Impact**: Submits concurrent promises using `Promise.all` inside `socket.js`.

---

### Date/Time: 2026-08-11T08:26:00Z
* **The Decision**: Replaced the hardcoded static `localhost:5173` CORS origin setting with a dynamic regex/list evaluator in Express and Socket.io.
* **The 'Why'**: The live app deployed on Vercel (`vercel.app`) was blocked by Render's CORS preflight rules when attempting to verification-verify Google OAuth and trigger websocket handshakes.
* **Impact**: Restores cross-domain requests, cookies, and websocket handshakes for production environments.

---

### Date/Time: 2026-08-11T08:29:00Z
* **The Decision**: Updated client-side socket initialization to dynamically target the `VITE_API_BASE_URL` env variable in production.
* **The 'Why'**: The client was fallback-replacing ports inside the Vercel static asset domain and requesting websockets on Vercel (which fails), rather than targeting the live backend on Render.
* **Impact**: Correctly points socket links to the Render backend at `https://speakspin.onrender.com`.

---

### Date/Time: 2026-08-11T08:36:00Z
* **The Decision**: Deferred microphone and SpeechRecognition starts behind an explicit **"START SPEAKING!"** user gesture tap.
* **The 'Why'**: Apple iOS Safari and mobile Chrome security sandboxes block access to microphone tracks and SpeechRecognition engines when triggered programmatically (e.g. automatically upon entering a route or receiving a socket event). They require a direct user tap event.
* **Impact**: Resolves silent transcription errors and mic lockout blocks for mobile device contestants.

---

### Date/Time: 2026-08-11T08:40:00Z
* **The Decision**: Integrated the server-side Whisper API transcription service as the primary speech parser in Battle Mode, rather than relying exclusively on the browser's Web Speech API.
* **The 'Why'**: Browser-native Web Speech engines can be highly inaccurate, drop syllables, or fail entirely depending on device hardware or connection pings. Incorporating the backend Whisper pipeline guarantees that actual voice uploads are accurately transcribed.
* **Impact**: Added transcription load screen overlays and Whisper calls directly into `BattleRecorder.jsx`.

---

### Date/Time: 2026-08-11T08:46:00Z
* **The Decision**: Downgraded client-side browser Web Speech API exceptions and timeout connection drops from `console.error` to `console.warn` inside `useSpeechRecognition.js`.
* **The 'Why'**: If the browser's internal speech connection drops (e.g. throws a network error), the client will automatically trigger the backend Whisper audio upload. Printing console errors for handled fallbacks creates false bug reports.
* **Impact**: Keeps the browser logs clean and silent.

---

### Date/Time: 2026-08-11T08:51:00Z
* **The Decision**: Enabled dynamic filename extensions (`.mp4` / `.webm`) matching the exact `audioBlob.type` before uploading to `api.js`.
* **The 'Why'**: Because Safari on iOS records raw streams in `.mp4` format, sending them with a hardcoded `.webm` name header caused the Groq decoder to throw format verification exceptions, dropping transcripts for iPhone competitors.
* **Impact**: Restores cross-browser speech transcription and scoring.

---

### Date/Time: 2026-08-11T08:55:00Z
* **The Decision**: Utilized a React mutable Ref `actualDurationRef` to store the active elapsed speaking duration instead of checking state hooks directly during submission callbacks.
* **The 'Why'**: Stale closures in React capture initial state values (like `actualDuration = 0`), which causes duration validation checks (`actualDuration >= 2`) to fail and skip backend transcription uploads, resulting in empty transcripts.
* **Impact**: Resolves transcription skips and enables accurate audio file uploads.

---

### Date/Time: 2026-08-11T09:16:00Z
* **The Decision**: Configured position mapping using the server-authoritative socket value `myPosition` instead of comparing string names.
* **The 'Why'**: Comparing string values against user name configs caused mismatch exceptions (as customized names or Google user profile setups varied), displaying identical scores or incorrect win/loss states to contestants.
* **Impact**: Displays correct personalized feedback and ELO change records.

---

### Date/Time: 2026-08-11T09:20:00Z
* **The Decision**: Built a dedicated `BattleProfile.jsx` dashboard linked from a new action portal inside the matchmaking lobby.
* **The 'Why'**: Competitive gamers need a dedicated summary of their matchmaking ratings, ELO peaks, consecutive wins, average/high scores, and outcome records (Wins/Losses/Draws) mapped against chronological opponents and topics.
* **Impact**: Saves formatted JSON history items in localStorage (`speakspin-battle-history`) upon completion of each duel and renders them in a styled dashboard.

---

### Date/Time: 2026-08-11T09:25:00Z
* **The Decision**: Changed ELO rating calculations from logarithmic expected values to flat ±30 ELO point increments.
* **The 'Why'**: Simple flat point alterations provide arcade game predictability and match the competitive pacing expectations of players.
* **Impact**: Updates the ELO results calculation values inside `backend/socket.js`.

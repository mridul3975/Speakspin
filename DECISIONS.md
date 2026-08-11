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

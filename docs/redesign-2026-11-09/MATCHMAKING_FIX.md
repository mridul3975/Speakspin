# Multiplayer connection and dropdown correction

The frontend socket address previously replaced the literal text `5173` with `3001`. On the actual `http://127.0.0.1:5174` preview, the result was still port 5174: multiplayer tried to contact Vite instead of the Socket.IO backend. The five-second server timer therefore never received the search. The backend was also not running during the reported failure.

App.jsx now connects to the configured VITE_API_BASE_URL, or the current frontend origin when no explicit API URL is configured. Vite forwards `/socket.io`, including WebSocket upgrades, to the backend at 127.0.0.1:3001. Both API and socket proxies use IPv4 loopback consistently. This works when Vite chooses another available frontend port.

The existing backend timer remains 5000 ms, including human-match priority and cancel/disconnect/retry cleanup. No bot-choice prompt or separate bot announcement was added.

## Verified

- Started the actual backend on port 3001; left it and the frontend preview running.
- Connected a Socket.IO client through the actual port-5174 frontend and received automatic pairing in **5012 ms**. Used an isolated test language and left the room immediately, without requesting transcription or scoring.
- Added `frontend/src/utils/socketProxy.test.js`: creates a frontend on an arbitrary port and verifies the real proxy configuration forwards a search and receives a bot after five seconds. Passed.
- The four existing backend socket tests passed, including human matching, readiness, cancellation, disconnect, and retry timing.
- Production build, 21 static UI render checks, scoped JSX lint, and whitespace checks passed.

## Dropdowns

Replaced the four product-level native selects (lobby language, solo category, solo language, battle language) with the existing [shadcn Select](https://ui.shadcn.com/docs/components/base/select) through GameSelect. Current value labels, language/category callbacks, and label associations are preserved. The popup has a scroll limit and game-theme selected/highlighted states.

These controls passed compilation and static rendering. Interactive browser verification remains subject to the previously recorded saved browser permission block.

## Local development

Run `npm start` from backend and `npm run dev -- --host 127.0.0.1` from frontend. The backend must remain running for multiplayer, even though the frontend and its assets load independently. Use the frontend URL printed by Vite; it no longer needs to be port 5173.

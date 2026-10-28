# SpeakSpin UI review and redesign plan

Date: 28 October 2026  
Requested direction: competitive arcade arena, with solo training.

## Scope and evidence

This is a source-based review of the current application, not a completed screenshot audit. The in-app browser was unavailable, browser inventory was empty, and the native capture helper could not connect. No rendered desktop/mobile screens, microphone flow, authenticated session, or live multiplayer match were visually tested. Layout effects below are predictions from current styles unless explicitly identified as code defects. No application code was changed.

Reviewed the application shell, all screen components, shared visual components, global CSS, Tailwind theme, entry HTML, and relevant multiplayer event wiring. Unused library primitives were not individually audited. Browser capture is the first remaining verification task.

## Overall assessment

SpeakSpin has a useful game loop: choose a challenge, reveal a topic, speak against a timer, receive a score, and play again. The interface does not give that loop a coherent visual identity. Most screens repeat black panels, thick white borders, offset white shadows, very heavy uppercase headings, and stock symbols. Battle spectacle is added through emoji, red glows, and decorative system language. These ingredients are individually familiar; their repeated application makes the result feel assembled from templates.

Keep the short rounds, topic wheel, direct battle entry, visible rating changes, and focused recording mode. Rebuild their hierarchy around the player's next action and current round state.

## Screen inventory

Health labels describe the implementation review, not observed rendered quality.

| Step | Surface | Health | Principal issue and planned change |
|---|---|---|---|
| 1 | Session loading | Needs work | Spinning sync symbol and “Initializing session”; use a short branded loading state with recovery on failure. |
| 2 | Home / mode choice | Major redesign | AI-coach tagline, glowing swords, oversized battle frame, and faint solo action pull in different directions. Make this the game lobby with battle primary, training visible, and player identity compact. |
| 3 | Solo setup | Needs work | A form enclosed in a heavy frame; duration tiles are click-only divs. Use an accessible round setup with duration choices, category, language, and a concise round summary. |
| 4 | Topic wheel | Repair and redesign | Tiny truncated labels, mismatched pointer/winner math, automatic advance. Give the wheel a readable result panel and an explicit continue action. |
| 5 | Solo recording | Major redesign | Transcript editor dominates a speaking task; technical messages and conflicting auto-submit/review behavior. Put topic, timer, mic state, and stop action first. |
| 6 | Solo judging | Needs work | Repeated fading status lines communicate decoration rather than actual stages. Show truthful waiting status and recovery. |
| 7 | Solo results | Major redesign | Five tabs, repeated metrics, missing score-ring styling, unsupported “perfect” example claim. Make a round summary with one next challenge and expandable detail. |
| 8 | Solo history and detail overlay | Repair and redesign | History entry is absent from home; chart values require hover; detail overlay lacks modal semantics. Add navigation, readable history, and an accessible detail view. |
| 9 | Battle lobby | Major redesign | Nested shell, giant emoji profile, generic console copy, fixed minimum width, decorative footer links. Use one game lobby and a compact player card. |
| 10 | Matchmaking | Needs work | Technical backend instructions appear in product UI; animated radar and timing copy have no recovery path beyond cancel. Use connection/search states with retry and clear cancellation. |
| 11 | Opponent found | Repair and redesign | Readiness never updates locally; fixed three-column cards and automatic readiness deserve verification. Use shared player cards and truthful ready states. |
| 12 | Battle topic reveal | Needs work | Nested heavy frame, word-by-word reveal, delayed countdown appearance. Show the full topic promptly and make preparation timing clear. |
| 13 | Battle recording | Major redesign | Extra start step after the battle countdown, transcript-heavy layout, simulated opponent waveform. Use a focused arena HUD and honest opponent status. |
| 14 | Battle judging | Repair and redesign | Simulated percentage and unverified vocal-projection commentary. Show submission and judging states without invented measurement. |
| 15 | Battle results | Major redesign | Many nested result panels, rainbow confetti, large reaction panel before replay actions, inaccurate loser guidance. Make outcome, score comparison, rating change, and rematch the first group. |
| 16 | Battle profile / avatar picker | Needs work | Generic stat boxes, emoji collection, undefined color token, inconsistent identity sources. Use a player card, coherent portraits, rank badge, and clear match history. |
| 17 | Save-profile prompt | Rewrite and simplify | Threatening skip label and benefits not demonstrated by current UI. Offer an honest save explanation and “Continue as guest.” |
| 18 | Login fallback | Cleanup | Separate “journey” marketing screen and an “Offline” guest control that submits a mock token. Align it with the real guest flow and verified account benefits. |

## Findings and fixes

Priority: P0 = repair misleading/broken UI behavior; P1 = main redesign; P2 = supporting polish.

### P0: correctness and trust

1. **Progress exists but cannot be opened from home.** `App.jsx:425` passes `onViewProgress`, but `LandingScreen` does not accept or render it. Add a working Progress destination in the shared navigation. The history empty-state “Start Practice” also calls `onBack`, which currently returns home; give it a real training action.

2. **Opponent ready status is disconnected.** `App.jsx:98` dispatches `socket_opponent_ready`; `OpponentFound.jsx:8` initializes `opponentReady` but never updates it. Wire the real state through props or a subscribed event. Ready badges must reflect both players, including cancellation/disconnection.

3. **The wheel can announce the wrong segment.** The pointer is above the canvas (`App.css:300`), corresponding to 270 degrees in the canvas coordinate system. Winner selection uses `360 - rotation + 90` (`SpinWheel.jsx:117`), selecting the opposite side of a ten-segment wheel. Use the same coordinate convention for drawing, pointer, and selection; test a known rotation before styling the reveal.

4. **The result score ring is incomplete.** `ScoreCircle.jsx:25,32` uses track/fill classes with no corresponding style definitions anywhere in the source. CSS also forces a 130px SVG despite a 150px component default, and both SVG and progress circle apply rotation. Define explicit fill/stroke styling, honor component size, and apply one rotation.

5. **Judging progress is invented.** `BattleAnalyzing.jsx:24` advances a random percentage independently of the request, including while awaiting the opponent. Replace it with actual states: “Speech submitted,” “Waiting for opponent,” and “Judging both speeches.” Only show a percentage if supplied by real work progress. Add timeout/retry/leave behavior appropriate to the match state.

6. **The opponent waveform implies data the client does not have.** `BattleRecorder.jsx:393` generates random bar heights from a speaking flag. Use a labeled speaking/submitted indicator. Retain the local waveform, which uses actual local audio levels.

7. **Several labels promise more than the current experience supports.** `SignupPrompt.jsx:17` advertises global leaderboards, achievements, and advanced practice access; these are not demonstrated by the current screen/navigation code, and solo category/duration selection already exists for guests. Audit the actual account contract before writing benefits. `FeedbackDashboard.jsx:314` calls a generated example “Perfect 100/100”; use “Example response.” `BattleProfile.jsx` says “Toastmasters AI Scale”; remove unless that claim has a supported basis.

8. **Result guidance contradicts available content.** `BattleResults.jsx:210` tells a losing player to study the opponent's speech logs, but its transcript tab displays only the player's own transcript. Point to available feedback or deliberately implement opponent review as a separately scoped feature.

9. **Technical failures interrupt the experience.** `App.jsx` uses browser alerts for authentication, judging, and multiplayer failures. `Matchmaking.jsx` exposes localhost, a shell command, and a backend directory. `SpeechRecorder.jsx` names the transcription provider. Replace these with contextual messages, a specific recovery action, and technical details confined to development diagnostics.

10. **Guest exits can lead to a blank lobby.** Match error, opponent-left, and disconnect handlers navigate to `BATTLE_LOBBY`, whose render condition excludes guests (`App.jsx:544`). Make recovery aware of session type, or provide one lobby that supports both. Also preserve the selected language when finding a new opponent; the signed-in result handler currently omits it.

### P1: the visual patterns that feel generic

11. **Everything receives the same visual emphasis.** `App.css:11-25` defines black surfaces, white accents, 2-3px white borders, and hard white shadows; screen components repeat 4px frames and 8px shadows. Reserve a strong frame/accent for the primary action or active player. Separate background, panels, and elevated overlays with distinct dark surface values and quieter borders.

12. **The design system fights itself.** `--border` is both a complete border declaration and a shadcn color variable (`App.css:17,1278`). `--accent-teal` is white, and `--accent-pink` is referenced but never defined. Generic library tokens describe a light theme while app screens hardcode black. Use one semantic dark theme; separate border color from width/style; migrate hardcoded values screen by screen.

13. **The universal square reset breaks intended shapes.** `App.css:32` applies `border-radius: 0 !important` to every element. It overrides inline circular radar rings and status dots. Remove the blanket rule and define intentional shapes for buttons, portraits, badges, and meters.

14. **Typography shouts continuously.** Many descriptions, utility labels, and controls use uppercase with 800-900 weight and wide tracking. Keep a distinctive display treatment for round titles and outcomes; use sentence case and ordinary weights for instructions and feedback. Limit fonts to a coherent display/body pair. Remove duplicate Google Font loading and component-injected Montserrat loading.

15. **Generic symbols substitute for a product identity.** The logo is a target glyph; the battle artwork is a glowing swords glyph; avatars, rank medals, reactions, and headers mix unrelated emoji and Material Symbols while Lucide is also installed. Build a small consistent icon family and a coherent set of player portraits/rank assets. Make voice, topic selection, and timed rounds the recurring motifs.

16. **Home is a promotional stack rather than a useful lobby.** `LandingScreen.jsx` repeats logo, large wordmark, AI tagline, swords, battle banner, language dropdown, aggressive copy, and a subdued training button. Replace this stack with player identity, the battle action, a clearly available solo option, selected language, and concise rules. “Spin a topic. Find your voice. Win the round.” is a proposed tone example, not a new feature claim.

17. **The interface overuses decoration that does not explain the game.** Examples include “PROVE YOUR SPEECH DOMINANCE,” `SYS.V.2026`, `> VIEW_PROFILE`, repeated lightning/trophy/skull emoji, robot judging commentary, and perpetual motion. Remove decorative terminal language. Give competitive energy to player introductions, topic reveal, countdown, and score settlement.

18. **Nested cards obscure the main result and next action.** Solo feedback repeats categories in overview and detail; battle results put multiple bordered sections and reactions above replay. Organize results as outcome/score, rating change where applicable, one helpful observation, next action, then optional detailed feedback/transcript. Keep reactions small and secondary.

19. **Speaking screens resemble transcription tools.** Both recorders prioritize transcript boxes and WPM metadata. Make the current topic and remaining time dominant, with a genuine mic indicator, local input level, and obvious stop/submit control. Hide or collapse transcript detail during the round. Establish a consistent solo review policy; current solo recording automatically submits valid transcripts even though the completed screen offers editing and analysis controls.

### P1: usability and accessibility

20. **Some primary interactions do not support keyboard use.** Duration tiles are clickable `motion.div` elements (`TimerSelector.jsx`); lobby avatar/name editors are clickable divs. Use buttons/radio groups, programmatic labels, visible focus, and selected-state semantics. Keep the wheel's explicit button as its keyboard entry point; give the canvas an equivalent textual result.

21. **Focus and modal behavior need a proper foundation.** Some native inputs/selects set `outline: none`; feedback tabs are plain buttons without tab relationships; the history detail overlay is a fixed div without dialog semantics or focus management. Use the existing accessible primitives, then test arrow keys, Escape, focus trapping, and return focus. Avoid announcing a timer every second; announce meaningful phase changes.

22. **Motion has no reduced-motion treatment.** No `prefers-reduced-motion` or `useReducedMotion` handling was found in application screens. Logo bobbing, radar pulses, rotating loaders, pulsing countdowns, typewriter reveal, floating reactions, and infinite confetti need calmer alternatives. Expose a sound toggle because result sounds play automatically.

23. **Phone layouts need deliberate composition.** The battle lobby's main area has `minWidth: 300px` inside multiple padded frames; versus cards use a fixed three-column grid; the result reaction row does not wrap; five feedback tabs can split into uneven rows. These are overflow/compression risks, not observed screenshots. Specify mobile layouts rather than shrinking desktop panels.

24. **The details grid has a real CSS typo.** `App.css:646` uses `grid-template-cols`, which the browser ignores. Correct it to `grid-template-columns`, then verify the intended wide-screen and narrow-screen counts.

25. **Charts and empty states do not complete the task.** History bars expose values only on hover, without an equivalent keyboard/text view. Add dates/scores in accessible text and make details reachable on touch. Empty history/profile views should provide a working action, and unavailable data should not be replaced with generic praise.

### P2: tone and finishing

26. **The save prompt pressures the player.** “Skip & Lose Progress” (`SignupPrompt.jsx:79`) is harsher than needed and does not explain the local-storage/account distinction. Use “Save your profile” and “Continue as guest,” with one accurate sentence about persistence. Do not clear valid local results merely to support the prompt.

27. **Coaching copy can sound judgmental or overconfident.** “POOR,” “Shy Whisperer,” “Calm Down Tips,” and definite “Anxiety Level” labels distract from skill improvement. Use constructive performance language and qualify transcript-derived observations. The backend receives transcript/timing for judging; the UI should not imply direct vocal or psychological measurement that those inputs cannot establish.

28. **Decorative controls weaken trust.** Lobby Terms/Privacy/Support entries are spans with no destination. Implement real links only when real content exists; otherwise remove the decorative entries. Align the login fallback with the actual guest-session entry instead of an “Offline” button that attempts mock-token login.

## Proposed design direction: a voice arena

The accepted world is a competitive arcade arena. The distinctive object is the topic wheel; the player's voice drives the round. Use the wheel's radial structure, microphone performance cues, and two-player introductions as the visual vocabulary.

- **Atmosphere:** deep ink background, slightly lighter arena panels, restrained electric cyan for the local player/action, warm coral for the rival, gold reserved for rank/victory. Starting color candidates need rendered contrast checks before adoption.
- **Typography:** a compact, expressive display face for the game title, round count, and result; a readable sans serif for topics, controls, and coaching; tabular digits for timers and scores. No pixel body text.
- **Surfaces:** a small family of framed arena panels with a clear active edge, quiet separators, modest corner treatment, and much less nesting. No blanket glow, rainbow decoration, or terminal filler.
- **Identity:** consistent player portraits and rank emblems reused in lobby, versus introduction, recording HUD, and results. Source or create actual assets during design; do not build a decorative asset collage.
- **Motion:** a brief player entrance, wheel settle, countdown beat, and score/rating settlement. Preserve topic reading time, offer reduced motion, and make sound optional.
- **Progression:** make existing rating, record, streak, and history meaningful. Do not add XP, quests, currencies, seasons, leaderboards, or achievements as decorative promises; those require separate product work.

## Target layouts

| Surface | Desktop composition | Phone composition | Primary action |
|---|---|---|---|
| Home / lobby | Compact player rail plus central mode selection and round explanation | Player strip, battle entry, training entry, then supporting details | Find a match |
| Solo setup | Centered setup with readable duration choices and round summary | Stacked choices; category/language controls; bottom action within reach | Spin topic |
| Wheel / reveal | Wheel as focal object; full topic appears in a separate readable panel | Wheel scales to available width; topic remains full-size readable text | Continue to round |
| Battle introduction | Balanced player cards, strong central versus treatment, clear readiness | Compact player comparison without squeezing names or ratings | Ready |
| Recording | Topic above a central timer/input indicator; compact player HUD; secondary transcript | Topic, remaining time, input state, thumb-reachable stop action | Finish speaking |
| Results | Outcome, balanced scores, rating delta, replay action; detail below | Outcome and replay in first content group; details expand below | Rematch / train again |
| Progress / profile | Player record and chronological matches; detail side panel or accessible dialog | Readable match rows with accessible details | Play again |

## Execution order

### Phase 1 — Establish visual evidence and a first-screen target

Restore browser access; capture current home, setup, wheel result, recording, results, lobby, profile, and save prompt at desktop and phone sizes. Use local fixture states for screens that require a second player or completed analysis; label fixtures explicitly. Produce a home/lobby visual concept in the accepted arena direction and confirm its composition before spreading it across the app.

Deliverable: before screenshots, one selected visual target, and a bounded asset list.

### Phase 2 — Repair shared styling and navigation

Create one dark token system in `App.css`/`tailwind.config.js`; reconcile existing UI primitives; remove the universal radius reset and conflicting border variable; fix missing score-ring styles and the grid typo. Build shared buttons, player card, rank badge, timer, state notice, and result summary. Add working home/training/progress/profile navigation, respecting the guest/account contract.

Deliverable: consistent shell and reusable components that match the chosen target.

### Phase 3 — Rebuild the lobby and solo loop

Implement home, setup, wheel, recorder, judging, and solo results. Fix wheel math and keyboard controls. Check microphone permission and input before the countdown; choose and clearly communicate review versus auto-submit. Replace alerts and technical provider messages with contextual recovery. Make the next round reachable immediately from results.

Deliverable: a coherent, usable solo game loop.

### Phase 4 — Rebuild the multiplayer loop

Reuse the same visual system for queue, player introduction, topic reveal, recording, judging, and results. Connect readiness to actual state. Remove simulated evaluation percentage and opponent waveform. Resolve guest recovery destinations, language preservation, and the second recording-start step in coordination with server timing. Bring rematch/new opponent actions ahead of reaction/detail panels.

Deliverable: consistent match states, truthful status, and an obvious replay path.

### Phase 5 — Finish progression, account, and edge states

Restyle profile/history and their empty/detail states. Correct unsupported feature claims, coercive signup copy, decorative links, and fallback login behavior. Keep real account and local persistence semantics visible. Apply the asset family and constructive coaching language throughout.

Deliverable: supporting screens that feel part of the same game.

### Phase 6 — Verify the complete experience

- Inspect representative screens at 360px, 390px, 768px, and 1440px widths, plus 200% zoom. Check long topics, 15-character player names, translated text, and RTL content.
- Complete the solo flow and a real two-client battle. Include permission denied, unsupported live speech recognition, no speech, short speech, transcription failure, slow analysis, disconnect, opponent departure, draw/loss/win, rematch, and guest exit.
- Verify keyboard navigation, visible focus, selected controls, dialog focus/closure, accessible status updates, touch targets, reduced motion, and sound preference. Measure text/control contrast on actual token combinations.
- Add narrow regression checks for wheel winner math, history navigation, readiness updates, and guest error recovery. Do not test purely decorative implementation details.
- Run the production build and applicable existing checks. Capture after screenshots for the same states and sizes as the baseline; compare the composition and interaction against the selected target.

## Definition of done

The player can identify battle and training immediately, knows whether the mic is ready, can read the complete topic, understands the round state and result, and can play again without searching. Every visible metric/status reflects real data or is clearly qualified. The same player identity, visual language, controls, and feedback patterns carry through every screen. Desktop and phone screenshots, keyboard checks, and completed solo/multiplayer runs support the final handoff.

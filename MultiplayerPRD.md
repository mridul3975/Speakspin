PART 2: MULTIPLAYER PRD
Document Information
Field	Value
Feature Name	SpeakSpin Battle Mode
Parent Product	SpeakSpin v1.0
Version	2.0
Type	Major Feature Addition
Priority	High
1. Feature Vision
1.1 The Problem with Solo Practice
text

Solo practice has a ceiling:
  ✗ No accountability partner
  ✗ No real stakes (easy to quit)
  ✗ No sense of relative performance
  ✗ Gets boring after repetition
  ✗ No community or social element
1.2 What Battle Mode Solves
text

Battle Mode creates:
  ✓ Real stakes (rating points to lose/gain)
  ✓ Accountability (someone is waiting for you)
  ✓ Relative benchmark (am I better than others?)
  ✓ Social energy (competing is exciting)
  ✓ Habit formation (come back for revenge, climb ranks)
  ✓ Community (shared experience, leaderboard)
1.3 Competitive Reference Points
App	Element We're Borrowing
Clash Royale	Rating/trophy system, battle lobby feel
Duolingo	Competitive leagues, streak system
Among Us	Matchmaking lobby atmosphere
Chess.com	ELO rating, "Play Again" loop
QuizUp	Real-time competitive head-to-head
2. User Stories
text

US-M001: Discovering Battle Mode
As a solo user
I want to discover a competitive option
So that I can test myself against real people

Acceptance Criteria:
- "⚔️ Battle Mode" button visible on landing page
- Shows real-time player count ("X players online")
- Clicking takes me to battle lobby instantly

---

US-M002: Setting Up My Battle Profile
As a new battle player
I want to customize my battle identity
So that I feel represented in the game

Acceptance Criteria:
- Can choose from 20 emoji avatars
- Can set a display name (max 15 chars)
- Can see my current rating and tier
- Profile saves automatically to localStorage
- Changes reflect immediately in preview

---

US-M003: Finding an Opponent
As a player ready to battle
I want to be matched fairly and quickly
So that I have a good competitive experience

Acceptance Criteria:
- Click one button to start searching
- See real-time feedback (searching animation, wait time)
- Match with someone within 30 seconds in ideal conditions
- Rating-based matching (similar skill level preferred)
- Bot offered if no human found in 30 seconds
- Can cancel search at any time

---

US-M004: Pre-Battle Moment
As a matched player
I want to see my opponent before we start
So that I feel the competitive tension build

Acceptance Criteria:
- See opponent's name, avatar, rating, tier
- See win/loss record comparison
- Must click "Ready" to proceed
- Auto-ready if don't click within 10 seconds
- See dramatic topic reveal animation

---

US-M005: Battle Recording
As a player in a live battle
I want to feel like I'm in a real competition
So that I'm motivated to perform my best

Acceptance Criteria:
- See my side of the screen with recorder
- See opponent's avatar and "speaking" status
- Shared timer counts down for both
- My transcript appears live
- Dramatic visual design makes it feel intense
- Auto-submit when timer reaches zero

---

US-M006: Receiving Battle Results
As a player who completed a battle
I want an epic, clear results reveal
So that winning feels great and losing feels motivating

Acceptance Criteria:
- Dramatic reveal animation (not just showing data)
- Clear winner/loser declaration
- Side-by-side score comparison for all 8 categories
- Rating change shown with animation (+25 / -12)
- Can send emoji reactions to opponent
- Option to rematch or find new opponent
- Can read full AI feedback for both players

---

US-M007: Rating Progression
As a regular battle player
I want to see my rating grow over time
So that I'm motivated to keep practicing

Acceptance Criteria:
- Rating changes after every battle
- Tier promotions are celebrated with animation
- Win streak tracked and displayed
- Battle history saved (last 50 battles)
- Can see rating progression in history screen
3. Technical Architecture
3.1 Real-Time Communication Flow
text

TIMELINE OF A COMPLETE BATTLE:

T+0:00  Player 1 clicks "Find Battle"
        → emit: find_match
        → server: add to queue

T+0:01  Player 2 clicks "Find Battle"
        → emit: find_match
        → server: add to queue, run matchmaking

T+0:02  Match found
        → server: create room, emit match_found to both
        → both clients: show OpponentFound screen

T+0:05  Player 1 clicks Ready
        → emit: player_ready
        → server: mark P1 ready, emit opponent_ready to P2

T+0:06  Player 2 clicks Ready
        → emit: player_ready
        → server: both ready, call startBattle()
        → emit: battle_starting to room

T+0:09  Server emits topic reveal
        → both clients: show TopicReveal screen

T+0:14  Server emits speaking_countdown (3-2-1)
        → both clients: show synchronized countdown

T+0:17  Server emits start_recording
        → both clients: start SpeechRecognition simultaneously

T+1:17  Timer reaches 0 (60s battle)
        → both clients: auto-emit submit_transcript
        → server: stores both transcripts

T+1:18  Server calls GPT-4o for both (parallel)
        → emit: analyzing_speeches to room
        → both clients: show analyzing screen

T+1:28  Analysis complete (10s typically)
        → server: calculate winner, ELO changes
        → emit: battle_results to room
        → both clients: show BattleResults screen

T+∞     Rematch or leave
3.2 Server Memory Structure
JavaScript

// Waiting queue
waitingQueue = [
  {
    socketId: "abc123",
    socket: <Socket object>,
    playerName: "SpeechKing",
    avatar: "🦁",
    rating: 1050,
    joinedAt: 1699000000000
  }
  // ...
]

// Active rooms
activeRooms = Map {
  "room_xyz" => {
    roomId: "room_xyz",
    players: [
      {
        socketId: "abc123",
        socket: <Socket>,
        playerName: "SpeechKing",
        avatar: "🦁",
        rating: 1050,
        position: "player1",
        ready: true,
        submitted: true,
        transcript: "Today I want to talk about...",
        actualDuration: 58,
        wordCount: 124,
        wantsRematch: false
      },
      { /* player 2 */ }
    ],
    topic: "What makes a great leader?",
    category: "Business & Career",
    duration: 60,
    status: "finished", 
    // status enum: 
    // 'waiting_ready' | 'topic_reveal' | 
    // 'recording' | 'analyzing' | 'finished'
    createdAt: 1699000000000
  }
}
3.3 Frontend State Machine
text

BATTLE STATE MACHINE:

'idle'                          ← Start here
    ↓ click "Find Battle"
'connecting'                    ← Socket connecting
    ↓ connected
'lobby'                         ← Show lobby/profile
    ↓ click "Find Battle"
'searching'                     ← In queue
    ↓ 'match_found' event
'opponent_found'                ← Show VS screen
    ↓ click "Ready" or timeout
'waiting_for_opponent_ready'    ← Waiting for them
    ↓ both ready
'topic_reveal'                  ← Show topic dramatically
    ↓ countdown ends
'recording'                     ← Battle in progress
    ↓ timer ends / manual stop
'submitted'                     ← Waiting for opponent
    ↓ 'battle_results' event
'results'                       ← Show results
    ↓ "Rematch" or "Leave"
'searching' or 'lobby'          ← Loop or exit
3.4 ELO System Detail
text

INITIAL RATING: 1000 for all new players

K-FACTOR: 32
  (Higher K = faster rating changes = more exciting)

EXPECTED SCORE FORMULA:
  E(A) = 1 / (1 + 10^((R(B) - R(A)) / 400))

OUTCOME SCORE:
  Win:  1.0
  Draw: 0.5 (when score difference ≤ 3 points)
  Loss: 0.0

RATING CHANGE:
  ΔR = K × (Actual - Expected)
  
  Example:
  Player A: 1200 rating
  Player B: 1000 rating
  Expected A to win: E(A) = 1/(1+10^(-200/400)) = 0.76
  
  If A wins:   ΔA = 32 × (1.0 - 0.76) = +7.68 ≈ +8
  If B wins:   ΔB = 32 × (1.0 - 0.24) = +24.32 ≈ +24
               ΔA = 32 × (0.0 - 0.76) = -24
  
  Upset win (lower rated wins) = MORE points gained
  Expected win = FEWER points gained
  (This is correct ELO behavior)

TIER BOUNDARIES:
  0-799:    Bronze   🥉 "Shy Whisperer"
  800-999:  Silver   🥈 "Rising Voice"  
  1000-1199: Gold    🥇 "Confident Speaker"
  1200-1399: Diamond 💎 "Eloquent Champion"
  1400-1599: Master  🔮 "Speech Master"
  1600+:    Legend   👑 "Grand Orator"

TIER PROMOTION CELEBRATION:
  - Full-screen animation when crossing tier boundary
  - "🎉 TIER UP! You are now Diamond!" message
  - 3 second celebration before continuing
4. Screen Design Specifications
4.1 Battle Lobby Screen
text

LAYOUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ← Back        ⚔️ Battle Mode        🌐 24 online
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ┌────────────────────────────────────────────┐
  │         YOUR BATTLE PROFILE                │
  │                                            │
  │           🦁  ← (tap to change)            │
  │                                            │
  │        [SpeechKing  ✏️]  ← (tap to edit)   │
  │                                            │
  │     💎 1,250        Gold Tier              │
  │     ████████████░░  progress to Diamond    │
  │                                            │
  │     W: 15  L: 8  D: 2    🔥 3 win streak  │
  └────────────────────────────────────────────┘

  ┌────────────────────────────────────────────┐
  │  ⚔️ FIND BATTLE  ← BIG PULSING RED BUTTON  │
  │  "Match with a player of similar skill"    │
  └────────────────────────────────────────────┘

  ┌────────────────────────────────────────────┐
  │  📊 TOP SPEAKERS THIS WEEK                 │
  │  1. 👑 GrandOrator    1,820               │
  │  2. 🔮 VoiceMaster    1,650               │
  │  3. 💎 TalkChamp      1,420               │
  │  4. 🥇 SpeechKing     1,250  ← YOU        │
  │  5. 🥇 WordSmith      1,180               │
  └────────────────────────────────────────────┘

BACKGROUND:
  Slow-moving particle field (20-30 particles)
  Each particle: small dot, random color from palette
  Random slow movement (CSS animation)
  Creates "space battle arena" feel

COLORS:
  Background: Deep dark (#0a0a1a)
  Battle button: Red gradient (#FF416C → #FF4B2B)
  Button glow: Red pulse animation
  Profile card: Dark card with subtle red border
  Online indicator: Green dot + count
4.2 Matchmaking Screen
text

LAYOUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

           🔍 FINDING YOUR OPPONENT...

     ┌──────────────────────────────────┐
     │                                  │
     │     [RADAR/PULSE ANIMATION]      │
     │                                  │
     │   Expanding rings from center    │
     │   Your avatar at center          │
     │   Slow rotation of outer ring    │
     │                                  │
     └──────────────────────────────────┘

         ⏱️ Searching: 0:12
         👥 47 players online

     ┌──────────────────────────────────┐
     │  Your Rating: ⭐ 1,250 Gold     │
     │  Searching within: ±200 points   │
     └──────────────────────────────────┘

         💡 "Start strong - your first 
             10 seconds set the tone"
         [tip rotates every 5 seconds]

         [Cancel Search]  ← ghost button

RADAR ANIMATION (CSS):
  @keyframes radar-pulse {
    0% { transform: scale(0.5); opacity: 0.8; }
    100% { transform: scale(3); opacity: 0; }
  }
  
  Three rings with staggered delay (0s, 0.5s, 1s)
  Color: accent teal, fading out as they expand

BOT OFFER (after 30 seconds):
  Slide up modal from bottom:
  ┌──────────────────────────────────────┐
  │  No opponents found nearby...        │
  │                                      │
  │  Battle a bot instead?               │
  │  🤖 SpeakBot 3000  ⭐ 1,100         │
  │                                      │
  │  [🤖 Fight Bot]  [Keep Searching]   │
  └──────────────────────────────────────┘
4.3 Opponent Found Screen
text

ANIMATION SEQUENCE:
  0ms:    Screen flashes white
  100ms:  "OPPONENT FOUND!" text slams in (scale 0→1.2→1)
  400ms:  VS card slides up from bottom
  600ms:  Player cards fly in from sides
  800ms:  Rating bars animate
  1000ms: Ready button appears

LAYOUT:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

          ⚡ OPPONENT FOUND! ⚡

  ┌────────────┐   VS   ┌────────────┐
  │            │  ════  │            │
  │     🦁     │        │     🦊     │
  │            │        │            │
  │ SpeechKing │        │  WordWiz   │
  │            │        │            │
  │  ⭐ 1,250  │        │  ⭐ 1,180  │
  │ 🥇 Gold    │        │ 🥇 Gold    │
  │            │        │            │
  │  W:15 L:8  │        │  W:12 L:9  │
  └────────────┘        └────────────┘

  ┌──────────────────────────────────────┐
  │  RATING COMPARISON                   │
  │  You: ████████████░░░░░░ 1,250       │
  │  Them: ██████████░░░░░░░ 1,180       │
  │  "Fairly matched battle!"            │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │         ✅ I'M READY!               │  ← pulsing green
  │      Auto-ready in: [4]             │  ← countdown bar
  └──────────────────────────────────────┘
  
  [Waiting for opponent...]   ← shows after you click

MESSAGES based on rating comparison:
  Within 50 pts:  "Evenly matched! This will be close."
  You +50-200:    "You have a slight edge. Don't slack!"
  You -50-200:    "Underdog alert! Surprise them!"
  You +200:       "Favored to win. Stay focused."
  You -200:       "Big challenge ahead. Give it everything!"
4.4 Topic Reveal Screen
text

CINEMATIC SEQUENCE (total: 5 seconds):

Frame 1 (0-500ms):
  Complete darkness
  Dramatic low hum sound

Frame 2 (500-1000ms):
  "YOUR TOPIC IS..." 
  Fades in slowly from center
  White text on black

Frame 3 (1000-1500ms):
  Pause for tension
  Subtle color shift in background

Frame 4 (1500-2000ms):
  Category badge slides in from left:
  [Technology]
  
Frame 5 (2000-3500ms):
  Topic text appears WORD BY WORD (typewriter):
  "Should...AI...replace...human...jobs?"
  Each word: 0.1s delay, slight bounce on entry

Frame 6 (3500-4000ms):
  Duration badge drops from top:
  ⏱️ 60 SECONDS
  
Frame 7 (4000-5000ms):
  "SPEAK IN..."
  Large countdown: 3 → 2 → 1
  Each number: scale bounce animation
  Sound: tick, tick, HORN

Frame 8 (at 0):
  "GO! 🎤" slams in
  Screen flash (white, 100ms)
  Transition to recording screen
4.5 Battle Recording Screen
text

LAYOUT (mobile-first, vertical):

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [Topic badge - compact at top]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  YOUR SIDE:
  ┌──────────────────────────────────────────┐
  │  🦁 SpeechKing              Words: 87   │
  │                                          │
  │  ┌─────────────────────────────────────┐ │
  │  │  Timer Ring: 0:42 remaining         │ │
  │  │  (large, teal, depleting)           │ │
  │  └─────────────────────────────────────┘ │
  │                                          │
  │  ┌─────────────────────────────────────┐ │
  │  │  Live transcript scrolling...        │ │
  │  │  "Today I want to discuss whether   │ │
  │  │   AI should replace human jobs..."  │ │
  │  └─────────────────────────────────────┘ │
  │                                          │
  │  [Audio visualizer bars]                 │
  └──────────────────────────────────────────┘

  DIVIDER: ══════════ ⚔️ VS ⚔️ ══════════

  OPPONENT SIDE:
  ┌──────────────────────────────────────────┐
  │  🦊 WordWiz                             │
  │                                          │
  │  [Avatar with speaking animation]        │
  │  Mic icon pulses                         │
  │  "🎤 SPEAKING..."                        │
  │                                          │
  │  Word count: ??? (hidden until results)  │
  │  [Mystery/blurred transcript]            │
  └──────────────────────────────────────────┘

BATTLE ATMOSPHERE:
  Background: Slowly shifting red/orange gradient
  Border: Pulsing red glow around entire screen
  Opponent avatar: Subtle pulse/bob animation
  When you speak: Your side glows teal
  Timer: Shared (same countdown for both)

STOP EARLY OPTION:
  Small "⏹ Submit Early" button (bottom right)
  Tap once: shows confirm modal
  "Submit your speech early? (42s / 60s recorded)"
  [Submit] [Keep Speaking]
4.6 Battle Results Screen
text

ANIMATION SEQUENCE:

Phase 1 - Drum Roll (1.5 seconds):
  Dark screen
  Text: "AND THE WINNER IS..."
  Builds tension with visual effect (particle gather)

Phase 2 - Winner Explosion (1 second):
  Winner avatar SLAMS onto screen from top
  Confetti particle explosion
  Winner name in large gold text
  "WINNER!" badge
  Trophy emoji bounces in

Phase 3 - Score Reveal (staggered, 3 seconds):
  Both player cards slide in from sides
  
  ┌───────────────────────────────────────────────┐
  │  [YOU 🦁]                    [OPPONENT 🦊]    │
  │  SpeechKing                  WordWiz           │
  │                                                │
  │  OVERALL:  78 ◄──────────────── 91            │
  │            [████████░░] [██████████]           │
  │                                                │
  │  CONFIDENCE: 75         85                     │
  │  FLUENCY:    82         89                     │
  │  RELEVANCE:  80         88                     │
  │  VOCABULARY: 76         92                     │
  │  STRUCTURE:  78         87                     │
  │  CLARITY:    81         93                     │
  │  ENGAGEMENT: 74         90                     │
  │  TIME MGMT:  77         89                     │
  │                                                │
  │  Each row animates in with 0.2s stagger       │
  │  Winning score highlighted in gold            │
  │  Losing score slightly dimmed                 │
  └───────────────────────────────────────────────┘

Phase 4 - Rating Change (1 second):
  ┌───────────────────────────────────────────────┐
  │  RATING CHANGE                                 │
  │                                                │
  │  You:  1,250 → 1,226    📉 -24                │
  │  Them: 1,180 → 1,204    📈 +24                │
  │                                                │
  │  Numbers count up/down animation (0.5s each)  │
  └───────────────────────────────────────────────┘

Phase 5 - Feedback Tabs (user scrolls):
  Tab: [Your Feedback] [Their Feedback] [Full Transcript]
  Your Feedback: Standard feedback from solo mode
  Their Feedback: (visible to learn from them too)

Phase 6 - Reactions:
  ┌───────────────────────────────────────────────┐
  │  SEND REACTION  🔥 😂 👏 😤 🤝 💀 😎 🫡      │
  │  [floating reactions appear when tapped]       │
  └───────────────────────────────────────────────┘

Phase 7 - Actions:
  ┌───────────────────────────────────────────────┐
  │  [⚔️ REMATCH!] ← pulses if opponent wants one │
  │  [🔍 New Opponent]                            │
  │  [🏠 Exit]                                    │
  └───────────────────────────────────────────────┘

SPECIAL CASES:
  If YOU WON:
    Gold/confetti theme
    "Victory!" message
    "You earned +24 rating points"
    Winner's quote overlay
    
  If YOU LOST:
    Blue/subdued theme  
    "Defeated..." message  
    "Keep practicing! You lost 24 rating points"
    Motivational message: "Study their feedback ↑"
    
  If DRAW:
    Purple theme
    "It's a DRAW!"
    "Both players earned/lost minimal points"
    
  TIER CHANGE (if crosses boundary):
    BEFORE showing results, show:
    Full screen: "🎉 TIER UP! Welcome to Diamond!"
    or: "📉 Tier Down... You're back to Gold"
    Then proceed to normal results
5. Bot System Specification
5.1 Bot Roster
JavaScript

const BOT_ROSTER = [
  {
    id: "bot_beginner",
    name: "Timid Tim",
    avatar: "🐢",
    rating: 700,
    tier: "Bronze",
    skillLevel: "beginner",
    description: "Speaks slowly, many fillers",
    scoreRange: [35, 55],
    personality: "nervous, hesitant, lots of 'um' and 'uh'"
  },
  {
    id: "bot_intermediate",
    name: "Average Andy", 
    avatar: "🤖",
    rating: 950,
    tier: "Silver",
    skillLevel: "intermediate",
    description: "Decent speaker, some hesitations",
    scoreRange: [55, 72],
    personality: "conversational, occasionally loses track"
  },
  {
    id: "bot_advanced",
    name: "SpeakBot 3000",
    avatar: "⚡",
    rating: 1150,
    tier: "Gold",
    skillLevel: "advanced",
    description: "Confident and clear",
    scoreRange: [72, 85],
    personality: "confident, structured, minor imperfections"
  },
  {
    id: "bot_expert",
    name: "VoiceAI",
    avatar: "💎",
    rating: 1400,
    tier: "Diamond",
    skillLevel: "expert",
    description: "Near-perfect speeches",
    scoreRange: [85, 95],
    personality: "eloquent, well-structured, excellent vocabulary"
  },
  {
    id: "bot_legend",
    name: "OmegaSpeaker",
    avatar: "👑",
    rating: 1700,
    tier: "Legend",
    skillLevel: "legendary",
    description: "Almost impossible to beat",
    scoreRange: [92, 99],
    personality: "masterful, compelling, inspiring"
  }
];
5.2 Bot Selection Logic
JavaScript

function selectBot(playerRating) {
  // Select bot closest to player's rating
  // Slight bias toward slightly higher rated bot (for challenge)
  
  const targetRating = playerRating + 50; // slight challenge bias
  
  return BOT_ROSTER.reduce((closest, bot) => {
    const closestDiff = Math.abs(closest.rating - targetRating);
    const botDiff = Math.abs(bot.rating - targetRating);
    return botDiff < closestDiff ? bot : closest;
  });
}
5.3 Bot Transcript Generation
text

Prompt to GPT-4o for generating bot transcript:

"Generate a realistic spoken speech transcript for the topic: 
'[TOPIC]'

The speaker's skill level is: [SKILL_LEVEL]
Duration was approximately [X] seconds.
The speaker should be: [PERSONALITY]

Skill level guidelines:
- beginner: many 'um', 'uh', 'like', repetitions, gets off topic
- intermediate: some fillers, decent structure, minor tangents  
- advanced: few fillers, good structure, clear delivery
- expert: minimal fillers, excellent structure, compelling
- legendary: near-perfect, inspiring, memorable

Return ONLY the transcript text, as if transcribed from speech.
Include natural speech patterns appropriate for skill level.
Length: approximately [WORD_COUNT] words (based on duration and level)."

Then analyze this generated transcript through the same
GPT-4o analysis endpoint as real players.

Bot score will naturally fall within expected range based
on transcript quality.
6. Error Handling
6.1 Disconnection Scenarios
text

SCENARIO 1: Opponent leaves during "searching"
  → No impact, they're removed from queue
  → You continue searching normally

SCENARIO 2: Opponent disconnects during "OpponentFound"
  → Server emits 'opponent_left' to you
  → You see: "Opponent left before the battle started"
  → Auto-return to matchmaking after 3 seconds

SCENARIO 3: Opponent disconnects during "Topic Reveal"  
  → Server emits 'opponent_disconnected' to you
  → You see: "⚡ Opponent fled! You Win! (No rating change)"
  → No ELO awarded (unfair win)

SCENARIO 4: Opponent disconnects DURING recording
  → Server emits 'opponent_disconnected' to you
  → You see: "⚡ Opponent disconnected - You Win!"
  → Full ELO awarded (you showed up, they didn't)
  → Your AI feedback still generated from your transcript

SCENARIO 5: YOU disconnect during recording
  → On reconnect: check if room still active
  → If room active and recording: show rejoin option
  → "You left a battle in progress. Your opponent won."
  → No ELO change (or small penalty in future)

SCENARIO 6: Server restarts
  → All rooms cleared (in-memory storage)
  → Connected players see disconnect message
  → They can start new search
  → This is acceptable for MVP

SCENARIO 7: Both players disconnect
  → Room cleaned up after 60 second timeout
  → No ELO changes
6.2 Analysis Failures
text

SCENARIO: GPT-4o fails for one player's transcript
  → Retry once (automatically, 3 second delay)
  → If retry fails: give that player a score based on
    word count and WPM (simple heuristic)
  → Proceed with results
  → Show note: "AI analysis had an issue. Score estimated."

SCENARIO: GPT-4o fails for BOTH players
  → Retry both simultaneously
  → If retry fails: cancel battle
  → Emit 'error' to both: "Analysis failed, no rating change"
  → Both return to lobby
  → Log error for debugging

HEURISTIC SCORE (fallback):
  baseScore = 50
  + (wordCount / expectedWordCount) * 15    // did they fill time?
  + (wordsPerMinute >= 100 ? 10 : 0)        // decent speed?
  + (wordsPerMinute <= 160 ? 10 : -5)       // not too fast?
  Clamp to 0-100
7. Performance Requirements
text

REAL-TIME REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Event             │ Max Latency   │ Notes
──────────────────┼───────────────┼──────────────────────
Socket connect    │ < 500ms       │ Must feel instant
Match found emit  │ < 100ms       │ After server decides
Ready sync        │ < 200ms       │ Both must see it fast
Countdown sync    │ < 100ms       │ Critical for sync
Start recording   │ < 100ms       │ Must be simultaneous
Submit receive    │ < 200ms       │ "Opponent submitted"
Results deliver   │ < 15 seconds  │ Includes AI analysis
Reaction send     │ < 100ms       │ Fun feature, must snappy

SCALABILITY (MVP):
  Target concurrent users: 50-100
  Active battles: up to 25 simultaneous
  Queue size: up to 50 waiting
  In-memory rooms: up to 50 active

  If scaling needed: 
  → Add Redis for queue/room storage
  → Add Socket.io adapter for Redis
  → Horizontal scaling becomes possible
  → This is post-MVP concern
8. Multiplayer-Specific Analytics
text

Track in localStorage (battle history array):

Each battle entry:
{
  id: timestamp,
  date: ISO string,
  mode: 'battle',
  opponent: {
    name: string,
    avatar: string,
    rating: number,
    isBot: boolean
  },
  topic: string,
  category: string,
  duration: number,
  myScore: number,
  opponentScore: number,
  winner: 'me' | 'opponent' | 'draw',
  myRatingBefore: number,
  myRatingAfter: number,
  ratingChange: number,
  categoryScores: { ... }
}

Derived stats to show in profile:
  totalBattles: history.length
  wins: history.filter(h => h.winner === 'me').length
  losses: history.filter(h => h.winner === 'opponent').length
  draws: history.filter(h => h.winner === 'draw').length
  winRate: (wins / totalBattles * 100).toFixed(1) + '%'
  avgScore: average of myScore
  bestScore: max of myScore
  favoriteCategory: most common category
  nemesisTopic: topic with most losses
  currentWinStreak: count from end while winner === 'me'
  bestWinStreak: max consecutive wins
  ratingHistory: array of ratings over time (for chart)
9. Implementation Checklist
text

BACKEND:
□ Install socket.io and nanoid
□ Create HTTP server wrapping Express app
□ Initialize Socket.io with CORS config
□ Create waitingQueue array
□ Create activeRooms Map
□ Create playerSockets Map
□ Implement find_match handler
□ Implement cancel_search handler
□ Implement tryMatchmaking() function
□ Implement createRoom() function
□ Implement startBattle() function (with countdown)
□ Implement player_ready handler
□ Implement submit_transcript handler
□ Implement analyzeAndRevealResults() function
□ Implement calculateELO() function
□ Implement getTier() function
□ Implement disconnect handler
□ Implement send_reaction handler
□ Implement request_rematch handler
□ Implement accept_rematch handler
□ Implement leave_room handler
□ Implement getRandomTopic() for server
□ Implement bot transcript generation
□ Change app.listen to httpServer.listen
□ Test with two browser tabs

FRONTEND:
□ Install socket.io-client
□ Create useSocket.js hook
□ Create useBattleState.js hook
□ Create elo.js utility
□ Add battle screens to App.jsx state machine
□ Add "⚔️ Battle Mode" to Landing screen
□ Create BattleLobby.jsx
   □ Avatar selector grid
   □ Name editor
   □ Rating + tier display
   □ Win/loss stats
   □ Leaderboard snippet
   □ Find Battle button
□ Create AvatarSelector.jsx
□ Create RatingBadge.jsx
□ Create Matchmaking.jsx
   □ Radar animation
   □ Wait timer
   □ Tips rotation
   □ Cancel button
   □ Bot offer modal
□ Create OpponentFound.jsx
   □ VS card layout
   □ Rating comparison
   □ Ready button + countdown
   □ Waiting state
□ Create TopicReveal.jsx
   □ Cinematic sequence
   □ Typewriter effect
   □ Countdown animation
□ Create BattleRecorder.jsx
   □ Split layout (you / opponent)
   □ Shared timer
   □ Live transcript (your side)
   □ Opponent status display
   □ Audio visualizer
   □ Submit early option
□ Create BattleAnalyzing.jsx
   □ Waiting for opponent state
   □ Both submitted state
   □ Progress animation
□ Create BattleResults.jsx
   □ Winner reveal animation
   □ Score comparison table
   □ Rating change animation
   □ Emoji reaction system
   □ Feedback tabs
   □ Rematch/Leave buttons
   □ Tier change celebration
□ Add sound effects (Web Audio API)
□ Add confetti system
□ Add particle background to lobby
□ Store/load player data from localStorage
□ Test complete flow (two tabs)
□ Test all disconnect scenarios
□ Test bot mode
□ Test ELO calculations
□ Mobile responsive check
10. Quick Reference Card
text

┌─────────────────────────────────────────────────────┐
│           SPEAKSPIN BATTLE - QUICK REFERENCE         │
├─────────────────────────────────────────────────────┤
│ NEW EVENTS (Client→Server):                         │
│  find_match, cancel_search, player_ready            │
│  submit_transcript, send_reaction                   │
│  request_rematch, accept_rematch, leave_room        │
├─────────────────────────────────────────────────────┤
│ NEW EVENTS (Server→Client):                         │
│  queue_joined, queue_update, match_found            │
│  opponent_ready, battle_countdown                   │
│  battle_starting, speaking_countdown                │
│  start_recording, opponent_submitted                │
│  analyzing_speeches, battle_results                 │
│  opponent_wants_rematch, opponent_left              │
│  opponent_disconnected, receive_reaction, error     │
├─────────────────────────────────────────────────────┤
│ BATTLE STATUS FLOW:                                  │
│  waiting_ready → topic_reveal → recording           │
│  → analyzing → finished                             │
├─────────────────────────────────────────────────────┤
│ ELO: K=32, starting=1000, draw if diff ≤3 pts      │
├─────────────────────────────────────────────────────┤
│ TIERS: Bronze<800 Silver<1000 Gold<1200             │
│        Diamond<1400 Master<1600 Legend 1600+        │
├─────────────────────────────────────────────────────┤
│ BOT TRIGGER: 30 seconds in queue with no match     │
├─────────────────────────────────────────────────────┤
│ NEW PACKAGES:                                        │
│  Backend: socket.io nanoid                          │
│  Frontend: socket.io-client                         │
├─────────────────────────────────────────────────────┤
│ TEST: Open 2 tabs → both click Find Battle          │
│       Should match in ~2 seconds                    │
└────────────────────────────────
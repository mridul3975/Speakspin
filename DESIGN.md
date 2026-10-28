---
name: SpeakSpin
description: A competitive voice arena for short speaking rounds and solo training.
colors:
  background: "#0b1018"
  foreground: "#edf4fc"
  surface: "#131d2b"
  surface-raised: "#1b293b"
  text-secondary: "#a5b6ca"
  accent: "#63e8e1"
  accent-foreground: "#092524"
  accent-hover: "#8ff5ef"
  accent-coral: "#ff9a88"
  gold: "#e8c47c"
  border: "#2c3a4d"
  secondary-button: "#1c2b3e"
  secondary-button-hover: "#2b3e56"
  control-background: "#0d1622"
  control-border: "#405169"
  danger-background: "#422c2b"
  danger-text: "#ffb3a4"
  danger-hover: "#593834"
  rank-background: "#342e24"
  selected-background: "#153b3f"
typography:
  display:
    fontFamily: "'Barlow Condensed', sans-serif"
    fontSize: "clamp(4rem, 6.6vw, 5.65rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "'Barlow Condensed', sans-serif"
    fontSize: "clamp(2.4rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.015em"
  title:
    fontFamily: "'Barlow Condensed', sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.05
  body:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.6
  button:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  score:
    fontFamily: "'Barlow Condensed', sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1
rounded:
  field: "8px"
  button: "9px"
  notice: "10px"
  choice: "11px"
  detail: "12px"
  compact-panel: "13px"
  panel: "16px"
spacing:
  compact: "8px"
  control-gap: "12px"
  content-gap: "20px"
  section-gap: "26px"
  panel-padding: "30px"
  shell-inline: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-secondary:
    backgroundColor: "{colors.secondary-button}"
    textColor: "{colors.foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "{colors.secondary-button-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "10px 6px"
  button-danger:
    backgroundColor: "{colors.danger-background}"
    textColor: "{colors.danger-text}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "12px 20px"
  button-danger-hover:
    backgroundColor: "{colors.danger-hover}"
  field:
    backgroundColor: "{colors.control-background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.field}"
    padding: "10px 13px"
    width: "100%"
  panel:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-padding}"
  rank-badge:
    backgroundColor: "{colors.rank-background}"
    textColor: "{colors.gold}"
    rounded: "6px"
    padding: "7px 10px"
  duration-choice:
    backgroundColor: "#0f1825"
    rounded: "{rounded.choice}"
    padding: "18px 16px"
  duration-choice-selected:
    backgroundColor: "{colors.selected-background}"
    textColor: "{colors.accent}"
---

# Design System: SpeakSpin

## Overview

**Creative North Star: "The Voice Arena"**

SpeakSpin brings competitive arcade energy to spontaneous speaking. The topic wheel, microphone, paired player introductions, and large round numbers make the game legible. Deep ink surfaces keep attention on the complete topic, the current phase, and the next action. Competition stays encouraging; results provide a useful next attempt.

The world was selected by the user and implemented from the approved redesign plan. This document records the implemented system in frontend/src/App.css and the shared game components; it does not imply approval of an image composition. The lobby's generated microphone artwork supplies spectacle, while controls, recording, and coaching stay calm.

**Key Characteristics:**

- Condensed display type for game moments; readable sentence-case instructions.
- Cyan local-player actions, coral rival signals, and gold rank or victory details.
- Tonal dark panels, modest corners, and quiet separators.
- Complete topics, real round state, and replay actions before detailed analysis.
- Native controls, visible keyboard focus, reduced motion, and optional sound.

## Colors

The palette combines cool ink foundations with clear competitive signals. Frontmatter values are the normative extracted colors; compatibility aliases in App.css resolve to the same palette. The sidecar's synthesized tonal ramps are preview metadata, not additional implemented surface tokens.

### Primary

- **Electric cyan** (accent): primary actions, local identity, selected duration, focus rings, and positive rating changes. Hover uses accent-hover. Dark accent-foreground keeps filled controls readable.

### Secondary

- **Warm coral** (accent-coral): rival identity, urgent timer state, loss outcome, and negative rating changes. Danger/rival buttons use the darker danger-background with danger-text.

### Tertiary

- **Victory gold** (gold): rank badges, the wheel pointer, versus marks, and result trophies or winning headlines. The small lavender solo-training icon is a local illustration detail, not a second action color.

### Neutral

- **Deep ink** (background): the page foundation.
- **Arena slate** (surface): primary panels; surface-raised supplies the solo score-ring track.
- **Ice text** (foreground): headings, primary copy, scores, and active navigation.
- **Muted steel** (text-secondary): instructions, metadata, secondary navigation, and quiet actions.
- **Quiet edge** (border): separators and shared library borders. Form controls use control-border so their boundaries remain apparent.
- **Control ink** (control-background): native selects and text fields.

**The Player Signal Rule.** Keep cyan attached to the local player and primary action, coral to the rival or caution, and gold to rank, versus, or outcome. Always pair state color with text or an icon.

## Typography

**Display Font:** Barlow Condensed, sans-serif. Weights 600, 700, and 800 are self-hosted in frontend/public/fonts; the accompanying OFL license is retained.

**Body Font:** Geist Variable, sans-serif, loaded through the @fontsource-variable/geist package.

The condensed face gives game moments a compact, assertive silhouette. Geist carries controls, full topics where appropriate, instructions, and constructive feedback. Ordinary paragraphs have a maximum measure of 70 characters; numerals in timers, ratings, and scores use tabular figures.

### Hierarchy

- **Display:** the lobby headline uses the display token and uppercase. At narrow widths the implementation sets it to 4.65rem.
- **Headline:** page headings use the headline token; mobile page headings commonly settle at 40px.
- **Title:** section headings use the title token. Utility section headings switch to Geist at 16px and weight 600.
- **Body:** the body token is the default; mobile body is 14px. Coaching and explanatory copy commonly use 13–14px with a relaxed line height.
- **Label:** fields use the label token; navigation is 13px and supporting metadata is usually 11–12px.
- **Score and time:** battle scores use the score token, reducing to 48px on phones. Battle time is 80px, reducing to 70px; the countdown is 90px. Keep tabular figures.

**The Game Moment Rule.** Reserve uppercase condensed display treatment for the lobby declaration and major outcomes. Instructions, controls, and feedback use ordinary sentence case.

## Layout

The centered application shell has a maximum width of 1328px, 48px horizontal padding, and 40px bottom padding. The non-playing header has a minimum height of 98px with a quiet bottom rule. Arena, Training, and Progress share that navigation; player and sound controls sit at the opposite edge. Playing phases remove the header and center content in an 850px area. General screen stacks cap at 900px; solo setup caps at 750px.

The desktop lobby uses a 224px player rail beside a flexible main area with a 30px gap. Match entry is the dominant illustration surface; solo training is a visible separate entry below it. Recording centers the full topic, timer, local input state, and finish action. Results put outcome, scores, rating delta where available, and replay controls before expandable detail.

Spacing values in the frontmatter are observed recurring distances, not a universal mathematical scale. Panels default to the panel-padding token; action rows use control-gap and screen stacks use section-gap.

- **At 1100px and below:** shell padding becomes 30px; the lobby rail becomes 200px, and dense header identity text is hidden.
- **At 800px and below:** shell padding becomes 22px; navigation wraps onto its own row. Lobby and battle setup become one column. The main lobby player rail moves after the match/training content and initially uses a two-column summary. In the dedicated battle lobby, match entry comes first and profile utilities follow. Wheel and selected topic stack.
- **At 520px and below:** shell padding becomes 16px; panels use 22px by 18px padding and compact-panel corners. The hero copy sits above the lower artwork crop, solo actions expand to full width, duration options become a two-by-two grid, form selects and feedback pairs stack, and the player rail becomes one column. Dedicated battle entry uses a 16px gap and 36px heading. Balanced versus and result comparisons retain two readable player columns with a narrower central mark; their player names use condensed 14px type on one line. Action rows wrap; the leave action can occupy its own row.
- **At 1450px and above:** the shell adds 12px top padding.

Long topics wrap in full. Versus and result player names stay on one line, using Barlow Condensed at 22px and 21px respectively on desktop, then 14px with 1.3 line height on phones. Extreme names ellipsize visually while retaining their full DOM text and title attribute. Other player identity copy can wrap. Transcript content uses automatic text direction where provided by the component.

## Elevation & Depth

The interface uses tonal layering rather than a CSS shadow vocabulary. Panels, control backgrounds, quiet border lines, and local/rival tinted surfaces establish hierarchy. The microphone artwork contains its own sculptural light and depth; that lighting is not a reason to add glow or shadow to every control. The lobby alone uses a directional ink gradient to preserve copy contrast over the art, changing from horizontal on desktop to vertical on phones.

**The Calm Surface Rule.** Keep ordinary panels flat. Use the shared surface, spacing, and separator patterns before adding another enclosing frame.

## Shapes

Panels are softly rectangular; controls are a little tighter. The panel, compact-panel, detail, button, and field radii in frontmatter describe those actual contexts. Notices use notice corners, duration choices use choice corners, and rank badges use small corners (6px). Avatars are rounded tiles: 48px with 12px corners by default, 84px with 22px corners when large, and 34px with 9px corners when small. Wheel hubs and search emblems are intentionally circular. Never apply a universal square-corner reset.

Lucide line icons provide the shared control and identity vocabulary. Player avatars derive a stable icon from the stored identity value; they are not photographic portraits. The topic pointer is a small gold triangle and numbered wheel sectors are matched with a separate full-text topic panel.

## Components

### Buttons

The shared game button is a native button with a minimum height of 46px, a 10px icon gap, and the button typography and radius tokens. Primary, secondary, ghost, and danger/rival variants use the frontmatter assignments. Secondary buttons add a quiet stroke; ghost actions reduce horizontal padding.

Hover changes the primary fill, secondary fill, or ghost text. Active enabled buttons move down by 1px. Disabled buttons have half opacity and a not-allowed cursor. Global keyboard focus is a 2px cyan outline with a 5px offset; do not remove it. Transitions for background, border, and transform last 180ms.

### Chips and player identity

Rank badges pair a small line emblem with the actual rank and ELO. Topic/category tags are compact cyan-tinted labels; filler-word tags stay neutral. Local and rival avatars retain their cyan and coral tint assignments wherever reused. Readiness adds readable text and an icon; waiting uses muted text.

### Cards / Containers

The shared panel is a flat surface with panel corners and panel padding. Detail containers tighten to detail corners and use native disclosure controls where the content can expand. Avoid nesting full panels for every metric. Reuse balanced local/rival introductions and score comparisons, with condensed single-line names and the full-text preservation described in Layout.

### Inputs / Fields

Use labeled native inputs and selects, with a minimum height of 46px, control-background, control-border, field corners, and inherited body type. Text areas are vertically resizable, have 150px minimum height, and use a 14px font with 1.7 line height. Placeholders are visibly muted. Retain the global focus outline.

Duration choices are labels containing real, visually hidden radio inputs in a fieldset. Selection adds cyan text and border over selected-background; focus-within adds a 2px cyan outline with a 4px offset. The current choice remains understandable through native checked state.

### Navigation

The compact wordmark combines a cyan audio-line mark with condensed type. Native navigation buttons use muted text by default, bright text on hover/current page, and a 2px cyan underline for the current destination. On phones navigation spans a second row. A skip link becomes visible on keyboard focus; route changes focus the main content. The sound control has a readable label and pressed state.

### Topic wheel and round HUD

The wheel uses numbered sectors instead of cramped prompt labels. The selected sector turns cyan; the complete topic is rendered next to or below it, receives focus, and is announced. The user explicitly continues to the microphone check. The normal spin lasts 3200ms with quartic ease-out; reduced motion settles immediately.

During speech, the topic, timer, microphone status, and finish control carry priority. Local level bars represent the actual microphone signal; opponent status is labeled speaking/submitted state. Keep transcript review secondary. Solo speech can be reviewed before scoring. Do not substitute decorative waveforms or evaluation percentages for unavailable data.

### Status, results, and motion

Informational, error, and success notices use distinct dark tonal fills and readable text. Errors use alert semantics; ordinary updates use status semantics. Waiting screens state what is actually pending and expose the applicable recovery action.

Results lead with a constructive outcome, score comparison, and replay actions. Rating changes carry a sign and text as well as color. Score breakdowns and transcripts sit in native details elements; reactions are a small secondary row.

Motion is restrained: 180ms control transitions, 100ms local level transitions, the finite wheel spin, and a 1.7s linear loading spinner. The app uses MotionConfig with reducedMotion set to user. The CSS reduced-motion query reduces animation/transition durations to 0.01ms, limits iteration to one, disables spinner rotation, and removes smooth scrolling. Do not make motion a prerequisite for reading a topic or choosing an action.

Game sound defaults to off. The explicit header toggle stores the preference in this browser; match, countdown, result, rating, and reaction sounds respect that preference.

## Do's and Don'ts

### Do:

- **Do** reuse the shared native game controls, visible cyan focus, and readable selected states.
- **Do** preserve full topics, full player-name text behind compact fitting, tabular scores, and replay before detailed analysis.
- **Do** keep cyan local, coral rival or caution, and gold rank, versus, or outcome.
- **Do** reuse the original microphone artwork at frontend/public/images/voice-arena.png with a crop that protects copy; its ImageGen prompt and provenance are stored beside it.
- **Do** keep feedback constructive and distinguish saved account history from browser-local battle statistics.
- **Do** preserve reduced-motion behavior and sound off by default.

### Don't:

- **Don't** invent XP, currencies, quests, achievements, leaderboards, or progress to decorate the arena.
- **Don't** imply acoustic or psychological measurements from transcript and timing data.
- **Don't** add fake waveforms, random judging percentages, terminal filler, or blanket glow.
- **Don't** replace native controls with click-only tiles or remove their keyboard focus.
- **Don't** force uppercase body copy, pixel body text, repeated heavy frames, or a universal radius reset.


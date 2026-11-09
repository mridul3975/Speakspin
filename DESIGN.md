---
name: SpeakSpin
description: A dimensional speaking game with illustrated mode selection and focused live rounds.
colors:
  background: "#111014"
  foreground: "#f6eef8"
  surface: "#1d1b23"
  surface-raised: "#2b2533"
  text-secondary: "#b8b0c5"
  accent: "#d8bdff"
  accent-foreground: "#291b3c"
  pink: "#f4acc9"
  gold: "#efcf9d"
  border: "#43394d"
  control-background: "#19151f"
typography:
  display:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "clamp(43px, 4.4vw, 66px)"
    fontWeight: 450
    lineHeight: 0.99
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "clamp(2rem, 3.8vw, 3.25rem)"
    fontWeight: 500
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  body:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  button:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  field: "10px"
  button: "12px"
  tile: "16px"
spacing:
  control-gap: "12px"
  tile-gap: "18px"
  scene-gap: "24px"
  shell-inline: "40px"
components:
  button-primary:
    textColor: "{colors.accent-foreground}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  button-secondary:
    textColor: "#f0d4e9"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "13px 21px"
  field:
    backgroundColor: "{colors.control-background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.field}"
    padding: "10px 13px"
    height: "46px"
  tile:
    rounded: "{rounded.tile}"
---

# Design System: SpeakSpin

## Overview

SpeakSpin uses a dimensional game-hub identity: original sculpted objects, smoked charcoal surfaces, violet illumination, blush highlights, and tactile controls. The player chooses a mode and enters a round; the visual hierarchy belongs to playable destinations.

The user supplied [Game Dashboard Interface by uixNinja](https://dribbble.com/shots/25615857-Game-Dashboard-Interface) after rejecting the earlier navy/cyan hero-and-stat-sidebar treatment. The 9 November implementation replaces that earlier direction. It adapts the reference's materials and composition to speaking rather than copying its artwork or product features.

This document records implemented code and assets. Browser visual verification is pending because a saved browser permission blocks the local preview, including after the user authorized review in chat.

## Colors

Charcoal surfaces give the violet and pink lighting room to establish depth. Pale lavender carries primary actions, selected controls, focus, and local-player accents. Pink highlights mode titles and rival identity. Rank names and ELO always come from the current data.

The CSS keeps old accent-teal and accent-coral variable names as compatibility aliases; they now resolve to lavender and pink. New code should use accent and accent-pink.

Use the normative foreground and secondary-text tokens for body copy. Utility status colors remain separate from decorative lighting.

## Typography

Geist Variable is self-hosted through the existing font package for both headings and body text. Headings use broad mixed-case lettering and moderate weight; condensed uppercase slogans are no longer the display voice.

The lobby's Battle display is 43–66 px at weight 450; phone uses 54 px. Scene headings use weight 500. Scores and timers use tabular numerals. Tracking never exceeds -0.04em. Long selected topics can wrap in full; compact player labels truncate with full names available through title text where applicable.

## Layout

The desktop shell uses a 176 px navigation rail, a 36 px content gap, and 40 px horizontal padding inside a maximum 1560 px width. The lobby contains only two illustrated cards: Battle and Solo, in a 1.5:1 desktop grid. The user explicitly removed the rank/profile card and both lower record cards. Profile access stays on the player icon; records remain in their existing destinations.

At 800 px, the navigation rail becomes compact. At 600 px and below, the two modes stack and navigation moves to a fixed bottom bar with reserved content space. Core scene styles define their own 700/760 px and smaller layouts.

Gameplay removes navigation chrome and uses a wider stage. Solo preparation, functional wheel, versus, topic reveal, speaking, and results have separate compositions. Shared tokens do not require identical panels.

## Elevation & Depth

Tiles use inset edge highlights and offset soft shadows. Raised controls have a light face, a darker lower edge, and a pressed state. Violet light pools sit behind objects and selected surfaces. The full component gradients and shadow recipes live in CSS and the sidecar rather than being misrepresented as flat color tokens.

Original transparent 3D assets are in frontend/public/images/game. Runtime references use the optimized WebP derivatives, totaling about 222 KB. PNG originals and exact generation prompts are retained alongside them. The Dribbble reference image is review evidence only.

The lobby has one brief arrival transition. Hover lift, wheel movement, and state changes carry the remaining motion. Speaking stages stay quiet. Reduced motion applies globally and optional sound retains the existing preference.

## Shapes

Main tiles use 16 px corners; buttons use 12 px; fields use 10 px. Player crests use a crisp shield silhouette around the existing deterministic identity icon. Utility icons use Lucide consistently. Topic wheels and pointers are functional geometric UI, not rasterized controls.

## Components

- GameButton supplies primary, secondary, ghost, and danger variants. Buttons default to type=button; forms explicitly request submit.
- GameSelect composes the existing shadcn Select primitives for every language/category dropdown. Options carry both values and labels; the current human-readable label is available before opening. Popup styling uses the game's charcoal/violet materials.
- PlayerAvatar preserves the existing avatar-string mapping and provides local/rival crest materials.
- RatingBadge uses the real rating tier and its associated text/color.
- LandingScreen presents only the Multiplayer and Solo mode cards, with the speaking-language control below. Profile and record content belongs in its dedicated screens.
- TimerSelector owns round duration, category, and language. SpinWheel remains the real canvas selection mechanism with a dimensional bezel and pointer.
- Solo and battle recorders retain microphone readiness, transcription, timing, and recovery behavior. Editable fallback transcripts have full-width styled controls.
- Results lead with the outcome or score and the replay action. Coaching and transcripts remain secondary disclosures.
- Empty records invite the first round; they do not contain sample wins, players, or scores.
- Automatic matchmaking fallback remains five seconds without a choice prompt or separate bot announcement.

## Do's and Don'ts

- Do use original speaking-game artwork with consistent chrome, grape, and blush materials.
- Do keep text, live scores, controls, and selection logic in the UI.
- Do preserve full topics, visible focus, keyboard control, actual state, and recovery actions.
- Do verify rendered desktop and phone compositions when browser permission is available.
- Don't restore the old promotional microphone hero plus full-height stat rail.
- Don't add decorative XP, currencies, events, leaderboards, or rewards without implementing their actual product behavior.
- Don't imply browser-local battle records are account-synced.
- Don't treat successful builds or static rendering as proof of microphone, authentication, API, or visual behavior.

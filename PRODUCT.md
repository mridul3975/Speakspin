# SpeakSpin

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

SpeakSpin is a speaking game with solo training and live one-versus-one rounds. A player receives a topic, speaks against a timer, and receives feedback and a score. The battle loop adds opponent matching, rating changes, and rematches.

## Users

People practicing spontaneous speaking through short game rounds. Exact age range and audience segmentation are open; the redesign does not assume them.

## Capabilities and Constraints

- Existing React/Vite/Tailwind frontend and Express/Socket.IO backend remain the application stack.
- Guest entry, Google sign-in, topic categories, duration choices, speaking languages, transcription, and feedback are existing capabilities.
- Solo history is retrieved for authenticated users; battle statistics currently use browser storage. Do not claim account-backed battle persistence until verified.
- Scores are based on transcripts and timing. Do not imply acoustic or psychological measurement from these inputs.
- No new achievements, currencies, quests, or leaderboards are authorized by the visual redesign.
- Microphone permission, unsupported recognition, no speech, slow requests, and disconnected opponents require clear recovery.

## Brand Commitments

The user selected a competitive arcade arena direction on 28 October 2026. On 9 November they rejected the resulting dashboard-like presentation, supplied uixNinja's Game Dashboard Interface as the visual reference, and authorized the replacement plan in docs/redesign-2026-11-09/PLAN.md for building. The new system uses dimensional game objects, charcoal surfaces, violet/pink lighting, and illustrated mode destinations. Retain the SpeakSpin name, topic wheel, solo training, and multiplayer match loop.

## Product Principles

- The next action and the current round state are immediately understandable.
- Status and progression use real data.
- Competition stays encouraging and feedback stays constructive.
- Keyboard, phone, reduced-motion, and sound preferences are part of the core experience.

## Evidence on Hand

Current source code, the attributed Dribbble reference, and live captures of the incumbent lobby/setup/wheel in docs/redesign-2026-11-09. The replacement implementation has passed the production build, existing game tests, and static component rendering. Browser verification of the replacement is pending because a saved browser permission denies the local preview, including after chat approval. No testimonials, player counts, global leaderboard, or achievement evidence is supplied.

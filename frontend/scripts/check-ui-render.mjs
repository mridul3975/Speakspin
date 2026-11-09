// Render representative game states without a browser, media access, or API calls.
// This catches render/import failures; it does not verify layout or interaction.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import Module from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const frontend = dirname(dirname(fileURLToPath(import.meta.url)));
const source = `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Landing from './src/components/LandingScreen';
import Setup from './src/components/TimerSelector';
import Wheel from './src/components/SpinWheel';
import Recorder from './src/components/SpeechRecorder';
import Analysis from './src/components/AnalyzingScreen';
import Feedback from './src/components/FeedbackDashboard';
import History from './src/components/ProgressHistory';
import BattleLobby from './src/components/multiplayer/BattleLobby';
import Matchmaking from './src/components/multiplayer/Matchmaking';
import OpponentFound from './src/components/multiplayer/OpponentFound';
import TopicReveal from './src/components/multiplayer/TopicReveal';
import BattleRecorder from './src/components/multiplayer/BattleRecorder';
import BattleAnalysis from './src/components/multiplayer/BattleAnalyzing';
import BattleResults from './src/components/multiplayer/BattleResults';
import BattleProfile from './src/components/multiplayer/BattleProfile';
const noop = () => {};
const player = { name: 'LongPlayerName15', playerName: 'LongPlayerName15', avatar: 'voice', rating: 1000, isGuest: true };
const rival = { name: 'AnotherPlayer15', avatar: 'shield', rating: 1100 };
const topic = { topic: 'Should cities make public transport free for everyone?', category: 'General' };
const feedback = { overallScore: 84, categories: { clarity: { score: 88, feedback: 'A clear central point.' } }, strengths: ['A specific example.'], improvements: ['Leave time for a conclusion.'], fillerWords: { count: 2, words: ['um'] }, exemplarSpeech: 'An example response.', overallFeedback: 'A thoughtful round.' };
const history = [{ id: 'fixture', date: '2026-11-09T00:00:00Z', topic: topic.topic, category: 'General', duration: 60, ...feedback }];
const battleResult = score => ({ player1: { ...player, ...feedback, overallScore: score, newRating: 1015, ratingChange: 15 }, player2: { ...rival, overallScore: 78 } });
export const cases = [
  ['lobby: mode selection', () => <Landing selectedLanguage="en-US" />, ['Play a 1v1', 'Play solo', 'role="combobox"', 'English (US)']],
  ['solo: preparation', () => <Setup selectedDuration={60} selectedCategory="General" selectedLanguage="en-US" />, ['Choose your round', 'Spin for a topic', 'checked=""', 'role="combobox"', 'English (US)']],
  ['solo: wheel', () => <Wheel selectedDuration={60} selectedCategory="General" />, ['Spin the wheel', 'Topics on this wheel']],
  ['solo: microphone entry', () => <Recorder topic={topic} targetDuration={60} selectedLanguage="en-US" />, [topic.topic, 'Your mic check comes first']],
  ['solo: transcript review', () => <Recorder topic={topic} targetDuration={60} selectedLanguage="en-US" initialTranscript="Words from the round." initialDuration={45} />, ['Words from the round.']],
  ['solo: analysis', () => <Analysis onCancel={noop} />, ['Speech submitted', 'Back to transcript']],
  ['solo: feedback', () => <Feedback topic={topic} analysis={feedback} onPracticeAgain={noop} onGoHome={noop} />, ['Speech score: 84 out of 100', 'Play another round', 'Skill breakdown']],
  ['solo: unavailable score', () => <Feedback topic={topic} analysis={{}} />, ['Score unavailable', 'Some scoring details are unavailable']],
  ['history: empty guest', () => <History isGuest onStartPractice={noop} />, ['Your next round starts here.']],
  ['history: saved round', () => <History history={history} onStartPractice={noop} />, ['Practice history', topic.topic]],
  ['battle: preparation', () => <BattleLobby user={player} selectedLanguage="en-US" />, ['Find a match', 'Change crest', 'battle-language']],
  ['battle: connected queue', () => <Matchmaking isConnected rating={1000} />, ['Finding your match', 'Cancel search']],
  ['battle: connecting', () => <Matchmaking isConnected={false} rating={1000} />, ['Opening the arena.', 'Connecting']],
  ['battle: opponent entry', () => <OpponentFound user={player} opponent={rival} />, ['Check mic &amp; ready up', rival.name]],
  ['battle: topic reveal', () => <TopicReveal topic={topic.topic} category="General" duration={60} startCountdown={5} selectedLanguage="en-US" />, [topic.topic]],
  ['battle: recorder entry', () => <BattleRecorder user={player} opponent={rival} topic={topic.topic} duration={60} selectedLanguage="en-US" />, [topic.topic, 'Starting your microphone']],
  ['battle: waiting for submission', () => <BattleAnalysis opponentSubmitted={false} />, ['Waiting for challenger']],
  ['battle: won result', () => <BattleResults results={battleResult(84)} myPosition="player1" />, ['Your round. Your win.', 'Rematch', 'New opponent']],
  ['battle: drawn result', () => <BattleResults results={battleResult(78)} myPosition="player1" />, ['A match worth repeating.']],
  ['battle: lost result', () => <BattleResults results={battleResult(70)} myPosition="player1" />, ['The next round is yours to change.']],
  ['battle: profile', () => <BattleProfile user={player} />, ['Your battle record is stored in this browser.']],
];
export const render = element => renderToStaticMarkup(element);
`;

const bundle = await build({
  stdin: { contents: source, resolveDir: frontend, sourcefile: 'ui-render-check.jsx', loader: 'jsx' },
  bundle: true, format: 'cjs', platform: 'node', packages: 'external', write: false,
  loader: { '.css': 'empty' }, define: { 'import.meta.env': '{}' }, logLevel: 'silent',
});
const filename = join(frontend, '.ui-render-check.cjs');
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(frontend);
globalThis.localStorage = { getItem: () => null };
compiled._compile(bundle.outputFiles[0].text, filename);
let passed = 0;
for (const [name, element, expected] of compiled.exports.cases) {
  try {
    const html = compiled.exports.render(element());
    for (const text of expected) assert.ok(html.includes(text), name + ': missing ' + text);
    if (name.startsWith('lobby:')) {
      assert.equal((html.match(/class="mode-tile /g) || []).length, 2, 'Lobby must have only Multiplayer and Solo cards');
      assert.doesNotMatch(html, /rank-tile-title|recent-battles-title|practice-record-title/);
    }
    for (const [, asset] of html.matchAll(/src="(\/images\/[^\"]+)"/g)) {
      assert.ok(existsSync(join(frontend, 'public', asset)), name + ': missing asset ' + asset);
    }
    if (name.includes('queue') || name.includes('connecting')) assert.doesNotMatch(html, /fight.?bot|play against a bot/i);
    passed++;
    console.log('PASS ' + name);
  } catch (error) { console.error('FAIL ' + name + ': ' + error.message); process.exitCode = 1; }
}
delete globalThis.localStorage;
console.log(passed + '/' + compiled.exports.cases.length + ' representative states rendered. Browser layout and interactions remain separate checks.');

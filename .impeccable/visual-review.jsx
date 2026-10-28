// Isolated screenshot fixture. Copy to frontend/.visual-review.jsx to serve with Vite.
// Use only with a disposable browser profile: BattleResults writes browser-local stats.
import React from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Mic, VolumeX } from 'lucide-react';
import '/src/App.css';
import FeedbackDashboard from '/src/components/FeedbackDashboard';
import BattleResults from '/src/components/multiplayer/BattleResults';
import OpponentFound from '/src/components/multiplayer/OpponentFound';
import TopicReveal from '/src/components/multiplayer/TopicReveal';
import BattleAnalyzing from '/src/components/multiplayer/BattleAnalyzing';
import SignupPrompt from '/src/components/SignupPrompt';
import BattleLobby from '/src/components/multiplayer/BattleLobby';

const noop = () => {};
const screen = new URLSearchParams(window.location.search).get('screen') || 'solo-results';
const topic = 'Should technology make our decisions easier, or teach us to make better decisions ourselves?';
const player = { id: 'fixture-player', playerName: 'MIDNIGHT_ORATOR', name: 'MIDNIGHT_ORATOR', avatar: 'mic', rating: 1000, isGuest: true };
const opponent = { name: 'CURIOUS_VOYAGER', avatar: 'shield', rating: 1040 };
const categories = {
  confidence: { score: 78, feedback: 'Your opening took a clear position. Keep the same conviction through your closing sentence.' },
  fluency: { score: 76, feedback: 'Most ideas connected smoothly. Replace repeated linking words with a short pause.' },
  relevance: { score: 86, feedback: 'Your example connected directly to the choice between convenience and independent thought.' },
  vocabulary: { score: 75, feedback: 'Precise, familiar words made your point easy to follow.' },
  structure: { score: 82, feedback: 'The opening, example, and conclusion formed a clear path through the topic.' },
  clarity: { score: 80, feedback: 'Your main argument was easy to identify. Shorten the longest sentence next time.' },
  engagement: { score: 73, feedback: 'The everyday example created a useful connection with your audience.' },
  timeManagement: { score: 74, feedback: 'You finished within the round. Save a little more time for the final takeaway.' },
};
const transcript = 'Technology should help us make better decisions, not quietly make every decision for us. Think about a navigation app. It can find the quickest route, but knowing why that route works matters when the road changes. The same is true of recommendations about what to study or how to spend our time. A useful tool shows its reasons, gives us alternatives, and lets us learn from the outcome. Convenience is valuable, but judgment grows through practice. We should ask technology to remove the busywork while keeping us involved in choices that shape our lives. The best system does more than offer an answer. It helps us ask a better question next time.';
const analysis = {
  overallScore: 78,
  categories,
  fillerWords: { count: 6, words: ['um', 'like', 'you know'], feedback: 'Try leaving a short pause between your example and conclusion.' },
  anxietyIndicators: { level: 'low', signs: ['Some repeated phrases appeared near the closing argument.'], tips: ['Choose the final sentence before you start, then speak toward it.'] },
  strengths: ['A clear opening position made the argument easy to follow.', 'A familiar navigation example supported your point.'],
  improvements: ['Use one short transition between the example and conclusion.', 'Finish with a single, memorable takeaway.'],
  overallFeedback: 'You made a clear case for tools that support human judgment. Your everyday example carried the argument; a tighter closing sentence would give the round a stronger finish.',
  challengeForNext: 'Open with your position, support it with one example, then finish with a single sentence that brings both together.',
  exemplarSpeech: 'Technology should strengthen our judgment, not replace it. A navigation app is useful because it shows a route. It becomes even more useful when it explains the alternatives and helps us understand the journey. The same principle should guide the tools we use to learn, work, and make everyday choices. Let machines handle the busywork. Keep people involved in the decisions that shape their lives. The best technology leaves us more capable after we use it.',
};
const results = {
  resultId: 'design-fixture-battle',
  roomId: 'design-fixture-room',
  topic,
  category: 'Tech / AI',
  winner: 'player1',
  player1: { ...player, ...analysis, name: player.playerName, rating: 1000, newRating: 1016, ratingChange: 16, transcript },
  player2: { ...opponent, overallScore: 72, categories, rating: 1040, newRating: 1024, ratingChange: -16, transcript: 'Technology is most useful when it gives us the time and information to think carefully about our choices.' },
};

// All fixture content is intentionally illustrative; no app API or microphone action is invoked.
localStorage.setItem('speakspin-player-name', player.playerName);
localStorage.setItem('speakspin-player-avatar', player.avatar);
localStorage.setItem('speakspin-rating', '1000');
localStorage.setItem('speakspin-wins', '8');
localStorage.setItem('speakspin-losses', '5');
localStorage.setItem('speakspin-win-streak', '2');
localStorage.setItem('speakspin-sound-enabled', 'false');

const screens = {
  'solo-results': <FeedbackDashboard topic={{ topic, category: 'Tech / AI' }} analysis={analysis} onPracticeAgain={noop} onGoHome={noop} selectedLanguage="en-US" />,
  'battle-results': <BattleResults user={player} results={results} myPosition="player1" onSendReaction={noop} onRematch={noop} onNewOpponent={noop} onLeave={noop} />,
  opponent: <OpponentFound user={player} opponent={opponent} opponentReady onReady={noop} onCancel={noop} />,
  topic: <TopicReveal topic={topic} category="Tech / AI" duration={60} startCountdown={5} selectedLanguage="en-US" />,
  judging: <BattleAnalyzing opponentSubmitted onLeave={noop} />,
  signup: <SignupPrompt onLoginSuccess={noop} onLoginError={noop} onSkip={noop} />,
  lobby: <BattleLobby user={player} onFindMatch={noop} onBack={noop} onViewProfile={noop} selectedLanguage="en-US" onChangeLanguage={noop} />,
};
const playing = ['opponent', 'topic', 'judging'].includes(screen);

function Fixture() {
  return <GoogleOAuthProvider clientId="1049594590390-designfixture.apps.googleusercontent.com">
    <div className={`app-shell${playing ? ' app-shell--playing' : ''}`}>
      {!playing && <header className="app-header">
        <div className="brand-lockup"><Mic strokeWidth={1.7} /><span>Speak<span>Spin</span></span></div>
        <nav className="app-nav" aria-label="Fixture navigation"><button type="button" aria-current="page">Arena</button><button type="button">Training</button><button type="button">Your progress</button></nav>
        <div className="header-controls"><span className="subtle-copy">{player.playerName}</span><span className="sound-toggle" aria-label="Sound off"><VolumeX size={17} /></span></div>
      </header>}
      <main className={`app-main${playing ? ' app-main--playing' : ''}`} style={{ marginBottom: 52 }}>{screens[screen] || screens['solo-results']}</main>
    </div>
    <div role="note" style={{ position: 'fixed', right: 12, bottom: 10, zIndex: 100, padding: '6px 10px', borderRadius: 5, background: '#342e24', color: '#f4dca2', font: '11px/1.4 system-ui, sans-serif', pointerEvents: 'none' }}>Design fixture — sample data</div>
  </GoogleOAuthProvider>;
}

createRoot(document.getElementById('root')).render(<Fixture />);

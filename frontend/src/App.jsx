import React, { useEffect, useRef, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { AudioLines, LogOut, Volume2, VolumeX, X } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import LandingScreen from './components/LandingScreen';
import TimerSelector from './components/TimerSelector';
import SpinWheel from './components/SpinWheel';
import SpeechRecorder from './components/SpeechRecorder';
import AnalyzingScreen from './components/AnalyzingScreen';
import FeedbackDashboard from './components/FeedbackDashboard';
import ProgressHistory from './components/ProgressHistory';
import LoginScreen from './components/LoginScreen';
import SignupPrompt from './components/SignupPrompt';
import { GameButton, LoadingState, PlayerAvatar, StatusNotice } from './components/game/GameUI';
import { analyzeText, loginWithGoogle, fetchCurrentUser, fetchHistory, clearHistoryDB, setAuthToken } from './utils/api';
import { isSoundEnabled, setSoundEnabled } from './utils/battleAudio';
import { useSocket } from './hooks/useSocket';
import BattleLobby from './components/multiplayer/BattleLobby';
import Matchmaking from './components/multiplayer/Matchmaking';
import OpponentFound from './components/multiplayer/OpponentFound';
import TopicReveal from './components/multiplayer/TopicReveal';
import BattleRecorder from './components/multiplayer/BattleRecorder';
import BattleAnalyzing from './components/multiplayer/BattleAnalyzing';
import BattleResults from './components/multiplayer/BattleResults';
import BattleProfile from './components/multiplayer/BattleProfile';
import { releaseBattleMicrophone } from './components/multiplayer/battleMicrophone';
import './App.css';

const SCREENS = {
  LANDING: 'LANDING', SETUP: 'SETUP', SPINNING: 'SPINNING', RECORDER: 'RECORDER',
  ANALYZING: 'ANALYZING', FEEDBACK: 'FEEDBACK', HISTORY: 'HISTORY',
  BATTLE_LOBBY: 'BATTLE_LOBBY', BATTLE_MATCHMAKING: 'BATTLE_MATCHMAKING',
  BATTLE_OPPONENT_FOUND: 'BATTLE_OPPONENT_FOUND', BATTLE_TOPIC_REVEAL: 'BATTLE_TOPIC_REVEAL',
  BATTLE_RECORDING: 'BATTLE_RECORDING', BATTLE_ANALYZING: 'BATTLE_ANALYZING',
  BATTLE_RESULTS: 'BATTLE_RESULTS', BATTLE_PROFILE: 'BATTLE_PROFILE', SIGNUP_PROMPT: 'SIGNUP_PROMPT',
};

function createGuest() {
  const name = localStorage.getItem('speakspin-player-name') || 'SPEAKER_' + Math.floor(1000 + Math.random() * 9000);
  localStorage.setItem('speakspin-player-name', name);
  return {
    id: 'guest', name, playerName: name, isGuest: true,
    avatar: localStorage.getItem('speakspin-player-avatar') || 'voice',
    rating: Number(localStorage.getItem('speakspin-rating')) || 1000,
  };
}

export function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('speakspin-battle-language') || 'en-US');
  const [currentTopic, setCurrentTopic] = useState(null);
  const [lastSpeech, setLastSpeech] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [history, setHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [notice, setNotice] = useState(null);
  const [sound, setSound] = useState(isSoundEnabled);
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [battleRoomId, setBattleRoomId] = useState(null);
  const [battleTopic, setBattleTopic] = useState(null);
  const [battleCategory, setBattleCategory] = useState(null);
  const [battleDuration, setBattleDuration] = useState(60);
  const [battleStartAt, setBattleStartAt] = useState(null);
  const [startCountdown, setStartCountdown] = useState(5);
  const [opponentSpeaking, setOpponentSpeaking] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [battleResults, setBattleResults] = useState(null);
  const [myPosition, setMyPosition] = useState('player1');
  const { socket, isConnected, connect, disconnect } = useSocket();
  const mainRef = useRef(null);
  const analysisRequestRef = useRef(0);
  const sessionVersionRef = useRef(0);
  const historyRequestRef = useRef(0);
  const isGuestSession = !!user && (user.isGuest || user.email === 'guest.speakspin@example.com' || user.id === 'guest');

  const navigateTo = (nextScreen) => {
    setNotice(null);
    setScreen(nextScreen);
  };

  const changeLanguage = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem('speakspin-battle-language', language);
  };

  const continueAsGuest = () => {
    sessionVersionRef.current += 1;
    analysisRequestRef.current += 1;
    historyRequestRef.current += 1;
    releaseBattleMicrophone();
    localStorage.removeItem('speakspin-token');
    setAuthToken(null);
    setUser(createGuest());
    setHistory([]);
    setLoadingUser(false);
    navigateTo(SCREENS.LANDING);
  };

  useEffect(() => {
    let active = true;
    const sessionVersion = sessionVersionRef.current;
    const isCurrentSession = () => active && sessionVersion === sessionVersionRef.current;
    async function initializeSession() {
      const savedToken = localStorage.getItem('speakspin-token');
      if (!savedToken) {
        if (isCurrentSession()) { setUser(createGuest()); setLoadingUser(false); }
        return;
      }
      try {
        setAuthToken(savedToken);
        const profile = await fetchCurrentUser();
        if (!isCurrentSession()) return;
        setUser(profile);
        setLoadingUser(false);
        try {
          const sessions = await fetchHistory();
          if (isCurrentSession()) setHistory(Array.isArray(sessions) ? sessions : []);
        } catch {
          if (isCurrentSession()) setNotice({ text: 'Your profile is ready, but saved practice could not load. Open Progress to retry.', tone: 'error' });
        }
      } catch {
        if (!isCurrentSession()) return;
        localStorage.removeItem('speakspin-token');
        setAuthToken(null);
        setUser(createGuest());
        setLoadingUser(false);
        setNotice({ text: 'Your sign-in could not be restored. You can keep playing as a guest or sign in again.', tone: 'info' });
      }
    }
    initializeSession();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true });
    document.title = screen.startsWith('BATTLE') ? 'SpeakSpin — Voice arena' : 'SpeakSpin — Play. Speak. Improve.';
  }, [screen, loadingUser]);

  useEffect(() => {
    if (!socket) return;
    const recoverMatch = (text, tone = 'info') => {
      releaseBattleMicrophone();
      setScreen(SCREENS.BATTLE_LOBBY);
      setNotice({ text, tone });
    };
    const handlers = {
      match_found: ({ roomId, opponent, yourPosition }) => {
        setBattleRoomId(roomId); setBattleOpponent(opponent); setMyPosition(yourPosition);
        setOpponentSpeaking(false); setOpponentSubmitted(false); setOpponentReady(false);
        setNotice(null); setScreen(SCREENS.BATTLE_OPPONENT_FOUND);
      },
      opponent_ready: () => setOpponentReady(true),
      battle_starting: ({ topic, category, duration }) => {
        setBattleTopic(topic); setBattleCategory(category); setBattleDuration(duration);
        setStartCountdown(5); setScreen(SCREENS.BATTLE_TOPIC_REVEAL);
      },
      speaking_countdown: ({ count }) => setStartCountdown(count),
      start_recording: ({ startAt } = {}) => { setBattleStartAt(startAt || Date.now()); setOpponentSpeaking(true); setScreen(SCREENS.BATTLE_RECORDING); },
      opponent_submitted: () => { setOpponentSpeaking(false); setOpponentSubmitted(true); },
      analyzing_speeches: () => { setOpponentSubmitted(true); setScreen(SCREENS.BATTLE_ANALYZING); },
      battle_results: (results) => { setBattleResults(results); setScreen(SCREENS.BATTLE_RESULTS); },
      opponent_wants_rematch: () => window.dispatchEvent(new CustomEvent('socket_opponent_wants_rematch')),
      receive_reaction: ({ reaction }) => window.dispatchEvent(new CustomEvent('socket_reaction', { detail: { reaction } })),
      opponent_disconnected: () => recoverMatch('Your opponent disconnected. Return to matchmaking when you are ready.'),
      opponent_left: () => recoverMatch('Your opponent left before the round. You can find another match.'),
      error: () => recoverMatch('The match could not continue. Please try finding another opponent.', 'error'),
    };
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
  }, [socket]);

  const getPlayer = () => ({
    playerName: localStorage.getItem('speakspin-player-name') || user?.name || 'Guest speaker',
    avatar: localStorage.getItem('speakspin-player-avatar') || user?.avatar || 'voice',
    rating: Number(localStorage.getItem('speakspin-rating')) || 1000,
    language: selectedLanguage,
  });

  const getBattleSocket = () => connect(import.meta.env.VITE_API_BASE_URL ||
    (window.location.hostname === 'localhost' ? 'http://localhost:3001' : window.location.origin.replace('5173', '3001')));

  const findMatch = (player = getPlayer()) => {
    releaseBattleMicrophone();
    const currentSocket = getBattleSocket();
    if (!currentSocket.connected) currentSocket.connect();
    currentSocket.emit('find_match', { ...player, language: player.language || selectedLanguage });
    setOpponentSubmitted(false); setOpponentReady(false);
    navigateTo(SCREENS.BATTLE_MATCHMAKING);
  };

  const handleStartBattleMode = () => {
    if (isGuestSession) findMatch();
    else { getBattleSocket(); navigateTo(SCREENS.BATTLE_LOBBY); }
  };

  const leaveBattle = () => {
    releaseBattleMicrophone();
    if (battleRoomId) socket?.emit('leave_room', { roomId: battleRoomId });
    socket?.emit('cancel_search');
    disconnect();
    setBattleRoomId(null);
    navigateTo(SCREENS.LANDING);
  };

  const leaveMatchForNavigation = () => {
    if (!screen.startsWith('BATTLE') && screen !== SCREENS.SIGNUP_PROMPT) return;
    releaseBattleMicrophone();
    if (battleRoomId) socket?.emit('leave_room', { roomId: battleRoomId });
    socket?.emit('cancel_search');
    disconnect();
    setBattleRoomId(null);
  };
  const openArena = () => { leaveMatchForNavigation(); navigateTo(SCREENS.LANDING); };
  const openProfile = () => { leaveMatchForNavigation(); navigateTo(SCREENS.BATTLE_PROFILE); };

  const handleLoginError = () => setNotice({ text: 'Sign-in did not complete. Try again, or keep playing as a guest.', tone: 'error' });
  const handleLoginSuccess = async (response) => {
    const sessionVersion = ++sessionVersionRef.current;
    setLoadingUser(true);
    try {
      const data = await loginWithGoogle(response.credential);
      if (sessionVersion !== sessionVersionRef.current) { setAuthToken(localStorage.getItem('speakspin-token')); return; }
      localStorage.setItem('speakspin-token', data.token);
      setUser(data.user);
      navigateTo(SCREENS.LANDING);
      try { const sessions = await fetchHistory(); if (sessionVersion === sessionVersionRef.current) setHistory(sessions); }
      catch { if (sessionVersion === sessionVersionRef.current) setNotice({ text: 'You are signed in. Saved practice could not load yet; open Progress to retry.', tone: 'error' }); }
    } catch { if (sessionVersion === sessionVersionRef.current) handleLoginError(); }
    finally { if (sessionVersion === sessionVersionRef.current) setLoadingUser(false); }
  };

  const openProgress = async () => {
    leaveMatchForNavigation();
    navigateTo(SCREENS.HISTORY);
    if (isGuestSession) return;
    const sessionVersion = sessionVersionRef.current;
    const requestId = ++historyRequestRef.current;
    const isCurrent = () => sessionVersion === sessionVersionRef.current && requestId === historyRequestRef.current;
    try { const sessions = await fetchHistory(); if (isCurrent()) setHistory(Array.isArray(sessions) ? sessions : []); }
    catch { if (isCurrent()) setNotice({ text: 'Saved practice could not load. Check your connection and try again.', tone: 'error', action: openProgress, actionLabel: 'Try again' }); }
  };

  const handleStartAnalysis = async (speech) => {
    const requestId = ++analysisRequestRef.current;
    setLastSpeech(speech);
    navigateTo(SCREENS.ANALYZING);
    try {
      const result = await analyzeText({ ...speech, topic: currentTopic.topic, category: currentTopic.category, targetDuration: selectedDuration, language: selectedLanguage });
      if (requestId !== analysisRequestRef.current) return;
      setAnalysisResults(result);
      setScreen(SCREENS.FEEDBACK);
      if (!isGuestSession) {
        const historyRequestId = ++historyRequestRef.current;
        const isCurrent = () => requestId === analysisRequestRef.current && historyRequestId === historyRequestRef.current;
        try { const sessions = await fetchHistory(); if (isCurrent()) setHistory(Array.isArray(sessions) ? sessions : []); }
        catch { if (isCurrent()) setNotice({ text: 'Your feedback is ready. Saved practice will refresh when you open Progress.', tone: 'info' }); }
      }
    } catch {
      if (requestId !== analysisRequestRef.current) return;
      setScreen(SCREENS.RECORDER);
      setNotice({ text: 'Your speech could not be scored. Your transcript is still here; review it and try again.', tone: 'error' });
    }
  };

  const clearHistory = async () => {
    historyRequestRef.current += 1;
    try { await clearHistoryDB(); setHistory([]); return true; }
    catch { setNotice({ text: 'Your saved practice could not be cleared. Please try again.', tone: 'error' }); return false; }
  };

  const isGameplayScreen = [SCREENS.RECORDER, SCREENS.ANALYZING, SCREENS.BATTLE_MATCHMAKING, SCREENS.BATTLE_OPPONENT_FOUND,
    SCREENS.BATTLE_TOPIC_REVEAL, SCREENS.BATTLE_RECORDING, SCREENS.BATTLE_ANALYZING].includes(screen);
  const startTraining = () => { leaveMatchForNavigation(); setLastSpeech(null); navigateTo(SCREENS.SETUP); };
  const player = user ? getPlayer() : null;

  let content;
  if (loadingUser) content = <LoadingState title="Warming up the arena" description="Getting your player profile ready."><GameButton variant="secondary" onClick={continueAsGuest}>Continue as guest</GameButton></LoadingState>;
  else if (!user) content = <LoginScreen onLoginSuccess={handleLoginSuccess} onLoginError={handleLoginError} onContinueGuest={continueAsGuest} />;
  else switch (screen) {
    case SCREENS.LANDING:
      content = <LandingScreen user={{ ...user, ...player }} onStart={startTraining} onViewProgress={openProgress} onViewProfile={openProfile} onStartBattle={handleStartBattleMode} selectedLanguage={selectedLanguage} setSelectedLanguage={changeLanguage} />;
      break;
    case SCREENS.SETUP:
      content = <TimerSelector selectedDuration={selectedDuration} onChangeDuration={setSelectedDuration} selectedCategory={selectedCategory} onChangeCategory={setSelectedCategory} selectedLanguage={selectedLanguage} onChangeLanguage={changeLanguage} onNext={() => navigateTo(SCREENS.SPINNING)} onBack={() => navigateTo(SCREENS.LANDING)} />;
      break;
    case SCREENS.SPINNING:
      content = <SpinWheel selectedDuration={selectedDuration} selectedCategory={selectedCategory} onTopicSelected={(topic) => { setCurrentTopic(topic); setLastSpeech(null); navigateTo(SCREENS.RECORDER); }} onBack={() => navigateTo(SCREENS.SETUP)} />;
      break;
    case SCREENS.RECORDER:
      content = <SpeechRecorder topic={currentTopic} targetDuration={selectedDuration} selectedLanguage={selectedLanguage} initialTranscript={lastSpeech?.transcript || ''} initialDuration={lastSpeech?.actualDuration || 0} onBack={startTraining} onAnalyze={handleStartAnalysis} />;
      break;
    case SCREENS.ANALYZING:
      content = <AnalyzingScreen onCancel={() => { analysisRequestRef.current += 1; navigateTo(SCREENS.RECORDER); }} />;
      break;
    case SCREENS.FEEDBACK:
      content = <FeedbackDashboard topic={currentTopic} analysis={analysisResults} selectedLanguage={selectedLanguage} onPracticeAgain={startTraining} onGoHome={() => navigateTo(SCREENS.LANDING)} />;
      break;
    case SCREENS.HISTORY:
      content = <ProgressHistory history={history} isGuest={isGuestSession} onStartPractice={startTraining} onBack={() => navigateTo(SCREENS.LANDING)} onClearHistory={clearHistory} />;
      break;
    case SCREENS.BATTLE_LOBBY:
      content = <BattleLobby user={{ ...user, ...player }} onFindMatch={findMatch} onBack={leaveBattle} onViewProfile={openProfile} selectedLanguage={selectedLanguage} onChangeLanguage={changeLanguage} />;
      break;
    case SCREENS.BATTLE_MATCHMAKING:
      content = <Matchmaking isConnected={isConnected} rating={player.rating} onCancel={() => { releaseBattleMicrophone(); socket?.emit('cancel_search'); navigateTo(SCREENS.BATTLE_LOBBY); }} onRetry={() => { socket?.emit('cancel_search'); findMatch(); }} />;
      break;
    case SCREENS.BATTLE_OPPONENT_FOUND:
      content = <OpponentFound user={player} opponent={battleOpponent} opponentReady={opponentReady} onReady={() => socket?.emit('player_ready', { roomId: battleRoomId })} onCancel={() => { releaseBattleMicrophone(); socket?.emit('leave_room', { roomId: battleRoomId }); navigateTo(SCREENS.BATTLE_LOBBY); }} />;
      break;
    case SCREENS.BATTLE_TOPIC_REVEAL:
      content = <TopicReveal topic={battleTopic} category={battleCategory} duration={battleDuration} startCountdown={startCountdown} selectedLanguage={selectedLanguage} />;
      break;
    case SCREENS.BATTLE_RECORDING:
      content = <BattleRecorder user={player} opponent={battleOpponent} topic={battleTopic} duration={battleDuration} startAt={battleStartAt} opponentSpeaking={opponentSpeaking} opponentSubmitted={opponentSubmitted} selectedLanguage={selectedLanguage} onFinishSpeech={({ transcript, actualDuration, wordCount }) => { socket?.emit('submit_transcript', { roomId: battleRoomId, transcript, actualDuration, wordCount }); navigateTo(SCREENS.BATTLE_ANALYZING); }} />;
      break;
    case SCREENS.BATTLE_ANALYZING:
      content = <BattleAnalyzing opponentSubmitted={opponentSubmitted} onLeave={leaveBattle} />;
      break;
    case SCREENS.BATTLE_RESULTS:
      content = <BattleResults user={player} results={battleResults} myPosition={myPosition} onSendReaction={(reaction) => socket?.emit('send_reaction', { roomId: battleRoomId, reaction })} onRematch={() => { setOpponentReady(false); setOpponentSubmitted(false); socket?.emit('request_rematch', { roomId: battleRoomId }); }} onNewOpponent={() => { socket?.emit('leave_room', { roomId: battleRoomId }); findMatch(); }} onLeave={() => { socket?.emit('leave_room', { roomId: battleRoomId }); if (isGuestSession) navigateTo(SCREENS.SIGNUP_PROMPT); else leaveBattle(); }} />;
      break;
    case SCREENS.BATTLE_PROFILE:
      content = <BattleProfile user={player} onBack={openArena} />;
      break;
    case SCREENS.SIGNUP_PROMPT:
      content = <SignupPrompt onLoginSuccess={handleLoginSuccess} onLoginError={handleLoginError} onSkip={leaveBattle} />;
      break;
    default: content = null;
  }

  return <MotionConfig reducedMotion="user"><div className={'app-shell' + (isGameplayScreen ? ' app-shell--playing' : '')}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    {!loadingUser && user && !isGameplayScreen && <header className="app-header">
      <button className="brand-lockup" onClick={openArena} aria-label="SpeakSpin home"><AudioLines aria-hidden="true" /><span>Speak<span>Spin</span></span></button>
      <nav className="app-nav" aria-label="Main navigation">
        <button aria-current={screen === SCREENS.LANDING ? 'page' : undefined} onClick={openArena}>Arena</button>
        <button aria-current={screen === SCREENS.SETUP || screen === SCREENS.SPINNING ? 'page' : undefined} onClick={startTraining}>Training</button>
        <button aria-current={screen === SCREENS.HISTORY ? 'page' : undefined} onClick={openProgress}>Progress</button>
      </nav>
      <div className="header-controls">
        <button className="sound-toggle" aria-label={sound ? 'Turn game sound off' : 'Turn game sound on'} aria-pressed={sound} onClick={() => { const enabled = !sound; setSound(enabled); setSoundEnabled(enabled); }}>{sound ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button className="header-player" onClick={openProfile} aria-label={'View ' + player.playerName + ' profile'}><PlayerAvatar avatar={player.avatar} name={player.playerName} size="small" /><span>{player.playerName}</span></button>
        {isGuestSession ? <div className="google-signin"><GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginError} theme="filled_black" shape="rectangular" size="medium" text="signin" /></div> : <button className="sound-toggle" onClick={() => { disconnect(); continueAsGuest(); }} aria-label="Sign out"><LogOut size={18} /></button>}
      </div>
    </header>}
    <main id="main-content" className={'app-main' + (isGameplayScreen ? ' app-main--playing' : '')} ref={mainRef} tabIndex={-1}>
      {notice && <StatusNotice tone={notice.tone} action={<div className="notice-actions">{notice.action && <GameButton variant="ghost" onClick={notice.action}>{notice.actionLabel}</GameButton>}<button className="notice-dismiss" aria-label="Dismiss message" onClick={() => setNotice(null)}><X size={18} /></button></div>}>{notice.text}</StatusNotice>}
      {content}
    </main>
  </div></MotionConfig>;
}

export default App;

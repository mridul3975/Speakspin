import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import io from 'socket.io-client';
import LandingScreen from './components/LandingScreen';
import TimerSelector from './components/TimerSelector';
import SpinWheel from './components/SpinWheel';
import SpeechRecorder from './components/SpeechRecorder';
import AnalyzingScreen from './components/AnalyzingScreen';
import FeedbackDashboard from './components/FeedbackDashboard';
import ProgressHistory from './components/ProgressHistory';
import LoginScreen from './components/LoginScreen';
import MultiplayerLobby from './components/MultiplayerLobby';
import MultiplayerBattle from './components/MultiplayerBattle';
import BattleResult from './components/BattleResult';
import { 
  analyzeText, 
  loginWithGoogle, 
  fetchCurrentUser, 
  fetchHistory, 
  clearHistoryDB,
  setAuthToken 
} from './utils/api';
import './App.css';

const SCREENS = {
  LANDING: 'LANDING',
  SETUP: 'SETUP',
  SPINNING: 'SPINNING',
  RECORDER: 'RECORDER',
  ANALYZING: 'ANALYZING',
  FEEDBACK: 'FEEDBACK',
  HISTORY: 'HISTORY',
  LOBBY: 'LOBBY',
  BATTLE: 'BATTLE',
  BATTLE_RESULT: 'BATTLE_RESULT'
};

export function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [selectedDuration, setSelectedDuration] = useState(60); // default 60s
  const [currentTopic, setCurrentTopic] = useState(null);
  const [actualDuration, setActualDuration] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Auth States
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // WebSockets State
  const [socket, setSocket] = useState(null);
  const [matchDetails, setMatchDetails] = useState(null);
  const [battleResults, setBattleResults] = useState(null);

  // Validate active auth tokens on mount
  useEffect(() => {
    async function initializeSession() {
      const savedToken = localStorage.getItem('speakspin-token');
      if (savedToken) {
        try {
          setAuthToken(savedToken);
          const profile = await fetchCurrentUser();
          setUser(profile);

          const sessions = await fetchHistory();
          setHistory(sessions);
        } catch (error) {
          console.warn('Session verification failed. Logging out...', error);
          handleSignOut();
        }
      }
      setLoadingUser(false);
    }
    initializeSession();
  }, []);

  const navigateTo = (nextScreen) => {
    setScreen(nextScreen);
  };

  const handleLoginSuccess = async (response) => {
    setLoadingUser(true);
    try {
      const data = await loginWithGoogle(response.credential);
      localStorage.setItem('speakspin-token', data.token);
      setUser(data.user);

      const sessions = await fetchHistory();
      setHistory(sessions);
      
      setScreen(SCREENS.LANDING);
    } catch (err) {
      console.error('Google Sign-In backend verification failed:', err);
      alert('❌ Authentication failed. Please check backend connection.');
    } finally {
      setLoadingUser(false);
    }
  };

  const handleLoginError = (error) => {
    console.error('Google Auth SDK error:', error);
    alert('❌ Google Login failed. Please check browser configurations or test in Guest Mode.');
  };

  const handleSignOut = () => {
    localStorage.removeItem('speakspin-token');
    setAuthToken(null);
    setUser(null);
    setHistory([]);
    setCurrentTopic(null);
    setAnalysisResults(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setScreen(SCREENS.LANDING);
  };

  const handleTopicSelected = (topicObj) => {
    setCurrentTopic(topicObj);
    navigateTo(SCREENS.RECORDER);
  };

  const handleStartAnalysis = async ({ transcript, actualDuration }) => {
    setActualDuration(actualDuration);
    navigateTo(SCREENS.ANALYZING);

    try {
      const result = await analyzeText({
        transcript,
        topic: currentTopic.topic,
        category: currentTopic.category,
        targetDuration: selectedDuration,
        actualDuration,
      });

      setAnalysisResults(result);

      const sessions = await fetchHistory();
      setHistory(sessions);

      navigateTo(SCREENS.FEEDBACK);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('❌ Failed to connect to AI Speech Coach. Please verify your internet connection or check the backend server logs.');
      navigateTo(SCREENS.RECORDER);
    }
  };

  const clearHistory = async () => {
    try {
      await clearHistoryDB();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear history in database:', err);
      alert('❌ Failed to clear history logs. Please try again later.');
    }
  };

  // --- MULTIPLAYER FLOWS ---
  const startMultiplayer = () => {
    const API_URL = window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin.replace('5173', '3001'); // Auto-target backend on preview/production
    const newSocket = io(API_URL);
    setSocket(newSocket);
    navigateTo(SCREENS.LOBBY);
  };

  const handleMatchFound = (details) => {
    setMatchDetails(details);
    navigateTo(SCREENS.BATTLE);
  };

  const handleBattleFinished = (results) => {
    setBattleResults(results);
    navigateTo(SCREENS.BATTLE_RESULT);
  };

  const handleLeaveBattle = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    setMatchDetails(null);
    setBattleResults(null);
    navigateTo(SCREENS.LANDING);
  };

  const handleBattleAgain = () => {
    setMatchDetails(null);
    setBattleResults(null);
    navigateTo(SCREENS.LOBBY);
  };

  // 1. Initial Loading Screen
  if (loadingUser) {
    return (
      <div className="app-container" style={{ justifyContent: 'center' }}>
        <div style={{ display: 'inline-block', fontSize: '3rem', animation: 'spin 3s linear infinite' }}>
          <span className="material-symbols-outlined text-5xl">sync</span>
        </div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>
          Initializing session...
        </p>
      </div>
    );
  }

  // 2. Authentication Login Screen
  if (!user) {
    return (
      <div className="app-container">
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess}
          onLoginError={handleLoginError}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* User Session Profile Header */}
      <div className="app-user-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user.picture ? (
            <img src={user.picture} alt={user.name} style={{ width: '32px', height: '32px', border: '1px solid #000000' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', border: '1px solid #000000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>SP</div>
          )}
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', lineHeight: 1.2, fontWeight: 700, textTransform: 'uppercase' }}>Welcome,</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</span>
          </div>
        </div>
        
        <button onClick={handleSignOut} className="btn-back-ghost" style={{ fontSize: '0.8rem', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 700 }}>
          <span className="material-symbols-outlined text-sm">logout</span> LOG OUT
        </button>
      </div>

      <AnimatePresence mode="wait">
        {screen === SCREENS.LANDING && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <LandingScreen
              onStart={() => navigateTo(SCREENS.SETUP)}
              onViewProgress={() => navigateTo(SCREENS.HISTORY)}
              onStartMultiplayer={startMultiplayer}
            />
          </motion.div>
        )}

        {screen === SCREENS.SETUP && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <TimerSelector
              selectedDuration={selectedDuration}
              onChangeDuration={setSelectedDuration}
              onNext={() => navigateTo(SCREENS.SPINNING)}
              onBack={() => navigateTo(SCREENS.LANDING)}
            />
          </motion.div>
        )}

        {screen === SCREENS.SPINNING && (
          <motion.div
            key="spinning"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <SpinWheel
              selectedDuration={selectedDuration}
              onTopicSelected={handleTopicSelected}
            />
          </motion.div>
        )}

        {screen === SCREENS.RECORDER && (
          <motion.div
            key="recorder"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <SpeechRecorder
              topic={currentTopic}
              targetDuration={selectedDuration}
              onBack={() => navigateTo(SCREENS.SETUP)}
              onAnalyze={handleStartAnalysis}
            />
          </motion.div>
        )}

        {screen === SCREENS.ANALYZING && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <AnalyzingScreen />
          </motion.div>
        )}

        {screen === SCREENS.FEEDBACK && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <FeedbackDashboard
              topic={currentTopic}
              analysis={analysisResults}
              onPracticeAgain={() => navigateTo(SCREENS.SETUP)}
              onGoHome={() => navigateTo(SCREENS.LANDING)}
            />
          </motion.div>
        )}

        {screen === SCREENS.HISTORY && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <ProgressHistory
              history={history}
              onBack={() => navigateTo(SCREENS.LANDING)}
              onClearHistory={clearHistory}
            />
          </motion.div>
        )}

        {/* Multiplayer Lobby Screen */}
        {screen === SCREENS.LOBBY && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <MultiplayerLobby
              socket={socket}
              user={user}
              onMatchFound={handleMatchFound}
              onBack={handleLeaveBattle}
            />
          </motion.div>
        )}

        {/* Multiplayer Battle Screen */}
        {screen === SCREENS.BATTLE && matchDetails && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <MultiplayerBattle
              socket={socket}
              user={user}
              matchDetails={matchDetails}
              onBattleFinished={handleBattleFinished}
              onLeave={handleLeaveBattle}
            />
          </motion.div>
        )}

        {/* Multiplayer Battle Results Comparison */}
        {screen === SCREENS.BATTLE_RESULT && battleResults && (
          <motion.div
            key="battleResult"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleResult
              user={user}
              results={battleResults}
              onBattleAgain={handleBattleAgain}
              onGoHome={handleLeaveBattle}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

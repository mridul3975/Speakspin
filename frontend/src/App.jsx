import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import TimerSelector from './components/TimerSelector';
import SpinWheel from './components/SpinWheel';
import SpeechRecorder from './components/SpeechRecorder';
import AnalyzingScreen from './components/AnalyzingScreen';
import FeedbackDashboard from './components/FeedbackDashboard';
import ProgressHistory from './components/ProgressHistory';
import LoginScreen from './components/LoginScreen';
import { 
  analyzeText, 
  loginWithGoogle, 
  fetchCurrentUser, 
  fetchHistory, 
  clearHistoryDB,
  setAuthToken 
} from './utils/api';
import './App.css';

// Multiplayer Imports
import { useSocket } from './hooks/useSocket';
import BattleLobby from './components/multiplayer/BattleLobby';
import Matchmaking from './components/multiplayer/Matchmaking';
import OpponentFound from './components/multiplayer/OpponentFound';
import TopicReveal from './components/multiplayer/TopicReveal';
import BattleRecorder from './components/multiplayer/BattleRecorder';
import BattleAnalyzing from './components/multiplayer/BattleAnalyzing';
import BattleResults from './components/multiplayer/BattleResults';
import BattleProfile from './components/multiplayer/BattleProfile';

const SCREENS = {
  LANDING: 'LANDING',
  SETUP: 'SETUP',
  SPINNING: 'SPINNING',
  RECORDER: 'RECORDER',
  ANALYZING: 'ANALYZING',
  FEEDBACK: 'FEEDBACK',
  HISTORY: 'HISTORY',
  BATTLE_LOBBY: 'BATTLE_LOBBY',
  BATTLE_MATCHMAKING: 'BATTLE_MATCHMAKING',
  BATTLE_OPPONENT_FOUND: 'BATTLE_OPPONENT_FOUND',
  BATTLE_TOPIC_REVEAL: 'BATTLE_TOPIC_REVEAL',
  BATTLE_RECORDING: 'BATTLE_RECORDING',
  BATTLE_ANALYZING: 'BATTLE_ANALYZING',
  BATTLE_RESULTS: 'BATTLE_RESULTS',
  BATTLE_PROFILE: 'BATTLE_PROFILE'
};

export function App() {
  const [screen, setScreen] = useState(SCREENS.LANDING);
  const [selectedDuration, setSelectedDuration] = useState(60); // default 60s
  const [selectedCategory, setSelectedCategory] = useState('General'); // default General category
  const [currentTopic, setCurrentTopic] = useState(null);
  const [actualDuration, setActualDuration] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Auth States
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Multiplayer States
  const { socket, isConnected, connect, disconnect } = useSocket();
  const [battleOpponent, setBattleOpponent] = useState(null);
  const [battleRoomId, setBattleRoomId] = useState(null);
  const [battleTopic, setBattleTopic] = useState(null);
  const [battleCategory, setBattleCategory] = useState(null);
  const [battleDuration, setBattleDuration] = useState(60);
  const [startCountdown, setStartCountdown] = useState(5);
  const [opponentSpeaking, setOpponentSpeaking] = useState(false);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [battleResults, setBattleResults] = useState(null);
  const [myPosition, setMyPosition] = useState('player1');

  // Handle battle sockets
  useEffect(() => {
    if (!socket) return;

    socket.on('queue_joined', ({ position }) => {
      console.log('Matchmaking queue joined. Queue position:', position);
    });

    socket.on('match_found', ({ roomId, opponent, yourPosition }) => {
      setBattleRoomId(roomId);
      setBattleOpponent(opponent);
      setMyPosition(yourPosition);
      setOpponentSpeaking(false);
      setOpponentSubmitted(false);
      navigateTo(SCREENS.BATTLE_OPPONENT_FOUND);
    });

    socket.on('opponent_ready', () => {
      window.dispatchEvent(new CustomEvent('socket_opponent_ready'));
    });

    socket.on('battle_starting', ({ topic, category, duration }) => {
      setBattleTopic(topic);
      setBattleCategory(category);
      setBattleDuration(duration);
      navigateTo(SCREENS.BATTLE_TOPIC_REVEAL);
    });

    socket.on('speaking_countdown', ({ count }) => {
      setStartCountdown(count);
    });

    socket.on('start_recording', () => {
      setOpponentSpeaking(true);
      navigateTo(SCREENS.BATTLE_RECORDING);
    });

    socket.on('opponent_submitted', () => {
      setOpponentSpeaking(false);
      setOpponentSubmitted(true);
    });

    socket.on('analyzing_speeches', () => {
      navigateTo(SCREENS.BATTLE_ANALYZING);
    });

    socket.on('battle_results', (results) => {
      setBattleResults(results);
      navigateTo(SCREENS.BATTLE_RESULTS);
    });

    socket.on('opponent_wants_rematch', () => {
      window.dispatchEvent(new CustomEvent('socket_opponent_wants_rematch'));
    });

    socket.on('receive_reaction', ({ reaction }) => {
      window.dispatchEvent(new CustomEvent('socket_reaction', { detail: { reaction } }));
    });

    socket.on('opponent_disconnected', () => {
      alert('⚡ Opponent disconnected - You Win! ELO adjusted.');
      navigateTo(SCREENS.BATTLE_LOBBY);
    });

    socket.on('opponent_left', () => {
      alert('Opponent left before the battle started.');
      navigateTo(SCREENS.BATTLE_LOBBY);
    });

    socket.on('error', ({ message }) => {
      alert(`❌ Match error: ${message}`);
      navigateTo(SCREENS.BATTLE_LOBBY);
    });

    return () => {
      socket.off('queue_joined');
      socket.off('match_found');
      socket.off('opponent_ready');
      socket.off('battle_starting');
      socket.off('speaking_countdown');
      socket.off('start_recording');
      socket.off('opponent_submitted');
      socket.off('analyzing_speeches');
      socket.off('battle_results');
      socket.off('opponent_wants_rematch');
      socket.off('receive_reaction');
      socket.off('opponent_disconnected');
      socket.off('opponent_left');
      socket.off('error');
    };
  }, [socket]);

  const handleStartBattleMode = () => {
    let API_URL = import.meta.env.VITE_API_BASE_URL;
    if (!API_URL) {
      API_URL = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : window.location.origin.replace('5173', '3001');
    }
    connect(API_URL);
    navigateTo(SCREENS.BATTLE_LOBBY);
  };

  const handleLeaveBattleMode = () => {
    disconnect();
    navigateTo(SCREENS.LANDING);
  };

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
              onStartBattle={handleStartBattleMode}
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
              selectedCategory={selectedCategory}
              onChangeCategory={setSelectedCategory}
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
              selectedCategory={selectedCategory}
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

        {screen === SCREENS.BATTLE_LOBBY && (
          <motion.div
            key="battle_lobby"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleLobby
              user={user}
              onFindMatch={(pData) => {
                socket.emit('find_match', pData);
                navigateTo(SCREENS.BATTLE_MATCHMAKING);
              }}
              onBack={handleLeaveBattleMode}
              onViewProfile={() => navigateTo(SCREENS.BATTLE_PROFILE)}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_MATCHMAKING && (
          <motion.div
            key="battle_matchmaking"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <Matchmaking
              rating={localStorage.getItem('speakspin-rating') ? Number(localStorage.getItem('speakspin-rating')) : 1000}
              onCancel={() => {
                socket.emit('cancel_search');
                navigateTo(SCREENS.BATTLE_LOBBY);
              }}
              onFightBot={(botId) => {
                socket.emit('fight_bot', { botId, playerRating: localStorage.getItem('speakspin-rating') ? Number(localStorage.getItem('speakspin-rating')) : 1000 });
              }}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_OPPONENT_FOUND && (
          <motion.div
            key="battle_opponent_found"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <OpponentFound
              user={{
                playerName: localStorage.getItem('speakspin-player-name') || user.name || 'Guest Speaker',
                avatar: localStorage.getItem('speakspin-player-avatar') || '🦁',
                rating: localStorage.getItem('speakspin-rating') ? Number(localStorage.getItem('speakspin-rating')) : 1000
              }}
              opponent={battleOpponent}
              onReady={() => {
                socket.emit('player_ready', { roomId: battleRoomId });
              }}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_TOPIC_REVEAL && (
          <motion.div
            key="battle_topic_reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <TopicReveal
              topic={battleTopic}
              category={battleCategory}
              duration={battleDuration}
              startCountdown={startCountdown}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_RECORDING && (
          <motion.div
            key="battle_recording"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleRecorder
              user={{
                playerName: localStorage.getItem('speakspin-player-name') || user.name || 'Guest Speaker',
                avatar: localStorage.getItem('speakspin-player-avatar') || '🦁',
              }}
              opponent={battleOpponent}
              topic={battleTopic}
              duration={battleDuration}
              opponentSpeaking={opponentSpeaking}
              onFinishSpeech={({ transcript, actualDuration, wordCount }) => {
                socket.emit('submit_transcript', {
                  roomId: battleRoomId,
                  transcript,
                  actualDuration,
                  wordCount
                });
                navigateTo(SCREENS.BATTLE_ANALYZING);
              }}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_ANALYZING && (
          <motion.div
            key="battle_analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleAnalyzing opponentSubmitted={opponentSubmitted} />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_RESULTS && (
          <motion.div
            key="battle_results"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleResults
              user={{
                playerName: localStorage.getItem('speakspin-player-name') || user.name || 'Guest Speaker',
                avatar: localStorage.getItem('speakspin-player-avatar') || '🦁',
                rating: localStorage.getItem('speakspin-rating') ? Number(localStorage.getItem('speakspin-rating')) : 1000
              }}
              myPosition={myPosition}
              results={battleResults}
              onSendReaction={(reaction) => {
                socket.emit('send_reaction', { roomId: battleRoomId, reaction });
              }}
              onRematch={() => {
                socket.emit('request_rematch', { roomId: battleRoomId });
              }}
              onNewOpponent={() => {
                socket.emit('leave_room', { roomId: battleRoomId });
                socket.emit('find_match', {
                  playerName: localStorage.getItem('speakspin-player-name') || user.name || 'Guest Speaker',
                  avatar: localStorage.getItem('speakspin-player-avatar') || '🦁',
                  rating: localStorage.getItem('speakspin-rating') ? Number(localStorage.getItem('speakspin-rating')) : 1000
                });
                navigateTo(SCREENS.BATTLE_MATCHMAKING);
              }}
              onLeave={() => {
                socket.emit('leave_room', { roomId: battleRoomId });
                handleLeaveBattleMode();
              }}
            />
          </motion.div>
        )}

        {screen === SCREENS.BATTLE_PROFILE && (
          <motion.div
            key="battle_profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <BattleProfile
              user={{
                playerName: localStorage.getItem('speakspin-player-name') || user.name || 'Guest Speaker',
                avatar: localStorage.getItem('speakspin-player-avatar') || '🦁'
              }}
              onBack={() => navigateTo(SCREENS.BATTLE_LOBBY)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;

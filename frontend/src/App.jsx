import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
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

const SCREENS = {
  LANDING: 'LANDING',
  SETUP: 'SETUP',
  SPINNING: 'SPINNING',
  RECORDER: 'RECORDER',
  ANALYZING: 'ANALYZING',
  FEEDBACK: 'FEEDBACK',
  HISTORY: 'HISTORY',
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

  // Validate active auth tokens on mount
  useEffect(() => {
    async function initializeSession() {
      const savedToken = localStorage.getItem('speakspin-token');
      if (savedToken) {
        try {
          setAuthToken(savedToken);
          // Verify JWT with backend
          const profile = await fetchCurrentUser();
          setUser(profile);

          // Fetch MongoDB speech history
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
      // Exchange Google ID token for backend session JWT
      const data = await loginWithGoogle(response.credential);
      localStorage.setItem('speakspin-token', data.token);
      setUser(data.user);

      // Load user database history
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
        category: currentTopic.category, // Pass category for database schema
        targetDuration: selectedDuration,
        actualDuration,
      });

      setAnalysisResults(result);

      // Reload database logs
      const sessions = await fetchHistory();
      setHistory(sessions);

      navigateTo(SCREENS.FEEDBACK);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('❌ Failed to connect to AI Speech Coach. Please verify your internet connection or check the backend server logs.');
      navigateTo(SCREENS.RECORDER); // Allow retry
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
        <div className="analyzing-robot" style={{ animation: 'spin 2s linear infinite', fontSize: '3rem' }}>🎯</div>
        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Initializing SpeakSpin session...
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
      <div className="app-user-header" style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user.picture ? (
            <img src={user.picture} alt={user.name} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--accent-teal)' }} />
          ) : (
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '1px solid var(--accent-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🎯</div>
          )}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', lineHeight: 1.2 }}>Welcome,</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
          </div>
        </div>
        
        <button onClick={handleSignOut} className="btn-back-ghost" style={{ fontSize: '0.85rem', color: 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <LogOut size={14} /> Log Out
        </button>
      </div>

      <AnimatePresence mode="wait">
        {screen === SCREENS.LANDING && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <LandingScreen
              onStart={() => navigateTo(SCREENS.SETUP)}
              onViewProgress={() => navigateTo(SCREENS.HISTORY)}
            />
          </motion.div>
        )}

        {screen === SCREENS.SETUP && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
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
      </AnimatePresence>
    </div>
  );
}

export default App;

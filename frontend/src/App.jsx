import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingScreen from './components/LandingScreen';
import TimerSelector from './components/TimerSelector';
import SpinWheel from './components/SpinWheel';
import SpeechRecorder from './components/SpeechRecorder';
import AnalyzingScreen from './components/AnalyzingScreen';
import FeedbackDashboard from './components/FeedbackDashboard';
import ProgressHistory from './components/ProgressHistory';
import { analyzeText } from './utils/api';
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

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('speakspin-history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to parse speech history from localStorage:', e);
      setHistory([]);
    }
  }, []);

  const navigateTo = (nextScreen) => {
    setScreen(nextScreen);
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
        targetDuration: selectedDuration,
        actualDuration,
      });

      setAnalysisResults(result);

      // Save to history
      const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        topic: currentTopic.topic,
        category: currentTopic.category,
        duration: actualDuration,
        overallScore: result.overallScore,
        overallFeedback: result.overallFeedback,
        categories: result.categories,
        fillerWords: result.fillerWords,
        anxietyIndicators: result.anxietyIndicators,
        strengths: result.strengths,
        improvements: result.improvements,
        challengeForNext: result.challengeForNext,
      };

      const updatedHistory = [newEntry, ...history].slice(0, 50);
      setHistory(updatedHistory);
      localStorage.setItem('speakspin-history', JSON.stringify(updatedHistory));

      navigateTo(SCREENS.FEEDBACK);
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('❌ Failed to connect to AI Speech Coach. Please verify your internet connection or check the backend server logs.');
      navigateTo(SCREENS.RECORDER); // back to recorder to allow retry
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('speakspin-history');
  };

  return (
    <div className="app-container">
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

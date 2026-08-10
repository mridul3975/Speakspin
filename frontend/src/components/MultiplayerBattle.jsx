import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { transcribeAudio } from '../utils/api';

export function MultiplayerBattle({ socket, user, matchDetails, onBattleFinished, onLeave }) {
  const { roomId, topic, players } = matchDetails;
  const opponent = players.find(p => p.id !== socket.id) || { name: 'Opponent' };

  const [battleState, setBattleState] = useState('countdown'); // countdown | recording | completed | waiting
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60); // Standard 60 seconds battle duration
  const [actualDuration, setActualDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [opponentState, setOpponentState] = useState('ready'); // ready | recording | completed
  const [opponentSubmitting, setOpponentSubmitting] = useState(false);

  const {
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { audioLevels } = useAudioLevel(battleState === 'recording');

  const timerRef = useRef(null);
  const actualDurationRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Sync transcript real-time
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Clean up hooks on unmount
  useEffect(() => {
    // Listen for WebSockets syncs
    socket.on('opponentStateUpdated', ({ state }) => {
      setOpponentState(state);
    });

    socket.on('opponentSubmittedScore', () => {
      setOpponentSubmitting(true);
    });

    socket.on('battleFinished', (results) => {
      socket.off('opponentStateUpdated');
      socket.off('opponentSubmittedScore');
      socket.off('battleFinished');
      socket.off('opponentLeft');
      onBattleFinished(results);
    });

    socket.on('opponentLeft', ({ message }) => {
      alert(`⚠️ ${message}`);
      handleExit();
    });

    // Handle initial recording countdown (simultaneous)
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startRecording();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) clearInterval(timerRef.current);
      stopLocalStream();
      socket.off('opponentStateUpdated');
      socket.off('opponentSubmittedScore');
      socket.off('battleFinished');
      socket.off('opponentLeft');
    };
  }, [socket, matchDetails]);

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const startRecording = async () => {
    setBattleState('recording');
    socket.emit('playerStateUpdate', { roomId, state: 'recording' });

    setEditableTranscript('');
    audioChunksRef.current = [];
    startListening();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stopLocalStream();
        await autoTranscribeAndSubmit(blob);
      };

      mediaRecorder.start(250);

      // Start duration countdown timer
      setTimeLeft(60);
      actualDurationRef.current = 0;
      setActualDuration(0);

      timerRef.current = setInterval(() => {
        actualDurationRef.current += 1;
        setActualDuration(actualDurationRef.current);

        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  const stopRecording = () => {
    setBattleState('completed');
    socket.emit('playerStateUpdate', { roomId, state: 'completed' });

    stopListening();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const autoTranscribeAndSubmit = async (blob) => {
    setIsTranscribing(true);
    setBattleState('waiting');
    let finalTranscript = '';

    try {
      const response = await transcribeAudio(blob);
      if (response && response.text) {
        finalTranscript = response.text;
      }
    } catch (err) {
      console.error('Multiplayer Whisper failed, falling back to Web Speech:', err);
      finalTranscript = transcript || editableTranscript;
    } finally {
      setIsTranscribing(false);
    }

    const finalCleanText = finalTranscript.trim();
    const wordCount = finalCleanText.split(/\s+/).filter(Boolean).length;

    // Direct mock grading to speed up battle scoring
    const wpm = actualDurationRef.current > 0 ? Math.round((wordCount / actualDurationRef.current) * 60) : 0;
    const fillers = ['um', 'uh', 'like', 'so', 'you know'];
    let fillerCount = 0;
    fillers.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = finalCleanText.match(regex);
      if (matches) fillerCount += matches.length;
    });

    const fluencyScore = Math.max(30, 95 - (fillerCount * 6));
    const pacingScore = wpm >= 110 && wpm <= 150 ? 95 : 60;
    const overallScore = Math.round((fluencyScore + pacingScore + (wordCount < 10 ? 30 : 85)) / 3);

    // Emit final score calculation to Socket Room
    socket.emit('submitScore', {
      roomId,
      score: overallScore,
      transcript: finalCleanText || 'Failed to capture speech transcript.',
      name: user.name || 'Guest Speaker'
    });
  };

  const handleExit = () => {
    socket.emit('leaveBattle');
    onLeave();
  };

  const wordCount = editableTranscript.trim().split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  // SVG configurations
  const size = 130;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / 60) * circumference;

  return (
    <div className="recorder-card" style={{ maxWidth: '750px', margin: '1.5rem auto 0' }}>
      {/* Simultaneous Battle Countdown Overlay */}
      <AnimatePresence>
        {battleState === 'countdown' && (
          <motion.div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: '#000000',
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ border: '4px solid #ffffff', padding: '3rem 2rem', backgroundColor: '#000000', width: '100%', maxWidth: '600px', boxShadow: '8px 8px 0px 0px #ffffff', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>BATTLE TOPIC ASSIGNED</span>
              <h2 className="recorder-topic-title" style={{ margin: '1rem 0 2rem 0' }}>"{topic.topic}"</h2>
              <motion.div
                key={countdown}
                style={{ fontSize: '6rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.2, opacity: 0 }}
                transition={{ duration: 0.85 }}
              >
                {countdown}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Status Dashboard */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', borderBottom: '2px solid #ffffff', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>YOU</span>
          <span style={{ fontWeight: 900, fontSize: '0.95rem' }}>{user.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="winner-category-tag" style={{ margin: 0 }}>{topic.category}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 800 }}>OPPONENT</span>
          <span style={{ fontWeight: 900, fontSize: '0.95rem', color: opponentState === 'recording' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
            {opponent.name} {opponentState === 'recording' && '🎤'}
          </span>
        </div>
      </div>

      <h1 className="recorder-topic-title">"{topic.topic}"</h1>

      {/* Mic Visualizer */}
      {battleState === 'recording' && (
        <div className="audio-visualizer-container">
          {audioLevels.map((lvl, index) => (
            <div key={index} className="visualizer-bar" style={{ height: `${Math.max(4, lvl * 50)}px` }} />
          ))}
        </div>
      )}

      {/* Main Timer Dial */}
      <div className="timer-container">
        <svg className="timer-circle-svg" width={size} height={size}>
          <circle className="timer-circle-track" cx={size / 2} cy={size / 2} r={radius} />
          <motion.circle
            className="timer-circle-fill"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>
        <div className="timer-time-display">
          <span className="timer-val">{timeLeft}s</span>
          <span className="timer-label">
            {battleState === 'recording' ? 'SPEAK!' : 'WAITING'}
          </span>
        </div>
      </div>

      {/* Transcript Log Box */}
      <div className="transcript-wrapper">
        <div className="transcript-header">
          <span>BATTLE TRANSCRIPT</span>
        </div>
        <div className="transcript-body" style={{ minHeight: '80px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {battleState === 'recording' && (editableTranscript || 'Start speaking into your mic...')}
          {battleState === 'waiting' && 'Recording finished. Waiting for Whisper analysis to match results...'}
          {battleState === 'completed' && 'Processing audio chunks...'}
        </div>
        <div className="transcript-meta" style={{ justifyContent: 'center', gap: '2.5rem' }}>
          <span>WORDS: <strong>{wordCount}</strong></span>
          <span>WPM: <strong>{wpm}</strong></span>
        </div>
      </div>

      {/* Battle Control Panels */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        {battleState === 'recording' && (
          <button className="btn btn-primary" onClick={stopRecording} style={{ borderColor: 'var(--accent-coral)' }}>
            <span className="material-symbols-outlined text-sm">stop</span> STOP RECORDING
          </button>
        )}

        {battleState === 'waiting' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
            <div style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>
              ⚡ {isTranscribing ? 'Transcribing speech audio...' : 'Score submitted! Waiting for opponent score...'}
            </div>
            {opponentSubmitting && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {opponent.name} has submitted their speech!
              </span>
            )}
            <button className="btn btn-secondary" onClick={handleExit}>
              <span className="material-symbols-outlined text-sm">logout</span> FORFEIT BATTLE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default MultiplayerBattle;

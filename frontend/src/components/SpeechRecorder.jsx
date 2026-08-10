import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mic, Square, Sparkles, RotateCcw, Edit2 } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';

export function SpeechRecorder({ topic, targetDuration, onBack, onAnalyze }) {
  const [recorderState, setRecorderState] = useState('idle'); // idle | countdown | recording | completed
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(targetDuration);
  const [actualDuration, setActualDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  const { audioLevels } = useAudioLevel(recorderState === 'recording');

  const timerRef = useRef(null);
  const actualDurationRef = useRef(0);

  // Sync speech recognition output with local editable transcript state
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (recorderState !== 'countdown') return;

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

    return () => clearInterval(interval);
  }, [recorderState]);

  // Recording countdown timer effect
  useEffect(() => {
    if (recorderState !== 'recording') return;

    setTimeLeft(targetDuration);
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recorderState, targetDuration]);

  const startCountdown = () => {
    setRecorderState('countdown');
  };

  const startRecording = () => {
    setRecorderState('recording');
    setEditableTranscript('');
    startListening();
  };

  const stopRecording = () => {
    stopListening();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecorderState('completed');
  };

  const tryAgain = () => {
    resetTranscript();
    setEditableTranscript('');
    setTimeLeft(targetDuration);
    setActualDuration(0);
    actualDurationRef.current = 0;
    setRecorderState('idle');
  };

  const handleAnalyzeClick = () => {
    const finalCleanText = editableTranscript.trim();
    const wordCount = finalCleanText.split(/\s+/).filter(Boolean).length;
    
    if (wordCount === 0) {
      alert('⚠️ No speech detected. Please start recording and speak or type your speech in the transcript box.');
      return;
    }
    if (wordCount < 10) {
      alert('⚠️ Speech too short! Please speak or write at least 10 words for a constructive AI analysis.');
      return;
    }
    
    onAnalyze({
      transcript: finalCleanText,
      actualDuration: actualDurationRef.current || 1,
    });
  };

  // Timer SVG Ring setup
  const size = 150;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressRatio = timeLeft / targetDuration;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isLowTime = timeLeft <= 10;
  const strokeColor = isLowTime ? '#FF6B6B' : '#4ECDC4';

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = editableTranscript.trim().split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  return (
    <div className="recorder-container">
      {/* Countdown Overlay */}
      <AnimatePresence>
        {recorderState === 'countdown' && (
          <motion.div
            className="countdown-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="countdown-content">
              <span className="countdown-sub">Get ready to speak about:</span>
              <h2 className="countdown-topic">"{topic.topic}"</h2>
              <motion.div
                key={countdown}
                className="countdown-number"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
              >
                {countdown}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Topic */}
      <div className="recorder-header-bar">
        {recorderState === 'idle' && (
          <button className="btn-back-ghost" onClick={onBack}>
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <div className="recorder-topic-pill">{topic.category}</div>
      </div>

      <h2 className="recorder-topic-title">"{topic.topic}"</h2>

      {/* Timer Ring */}
      <div className={`timer-ring-wrapper ${isLowTime && recorderState === 'recording' ? 'pulse-danger' : ''}`}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="timer-text-content">
          <span className="timer-digits">{formatTime(timeLeft)}</span>
          <span className="timer-label">
            {recorderState === 'idle' && 'READY'}
            {recorderState === 'recording' && 'REMAINING'}
            {recorderState === 'completed' && 'DONE!'}
          </span>
        </div>
      </div>

      {/* Visualizer (Only visible while recording) */}
      <div className="visualizer-container" style={{ visibility: recorderState === 'recording' ? 'visible' : 'hidden' }}>
        {audioLevels.map((lvl, index) => (
          <motion.div
            key={index}
            className="visualizer-bar"
            style={{
              height: `${Math.max(4, lvl * 60)}px`,
            }}
            animate={{
              background: `linear-gradient(to top, #4ECDC4, #FF6B6B)`
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          />
        ))}
      </div>

      {/* Transcript Box - Make it a textarea for edit/manual entry support */}
      <div className="transcript-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ margin: 0 }}>Transcript Box</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Edit2 size={12} /> Editable
          </span>
        </div>
        
        <textarea
          className="transcript-box-scroll"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.95rem',
            line-height: '1.5',
            resize: 'none',
            fontFamily: 'inherit'
          }}
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          placeholder={
            recorderState === 'recording'
              ? 'Listening... Start speaking into your mic now!'
              : 'Microphone speech will appear here. Alternatively, you can type your speech here manually if speech recognition fails.'
          }
        />
        {interimTranscript && (
          <p className="interim-text" style={{ fontSize: '0.95rem', marginTop: '0.25rem', opacity: 0.7 }}>
            {interimTranscript}
          </p>
        )}
      </div>

      {/* Word stats */}
      <div className="recorder-stats-row">
        <span>Words: <strong>{wordCount}</strong></span>
        <span>WPM: <strong>{wpm}</strong></span>
      </div>

      {/* Errors or unsupported alerts */}
      {!isSupported && <div className="recorder-alert-warning">⚠️ {speechError}</div>}
      {isSupported && speechError && (
        <div className="recorder-alert-danger">
          ⚠️ {speechError} 
          <span style={{ display: 'block', fontSize: '0.8rem', marginTop: '0.25rem', opacity: 0.8 }}>
            (You can still type/paste your speech in the text box above to get AI coaching analysis)
          </span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="recorder-controls">
        {recorderState === 'idle' && (
          <>
            <button className="btn btn-primary" onClick={startCountdown} disabled={!isSupported}>
              <Mic size={18} /> Start Recording
            </button>
            {/* Allow bypassing speech recorder completely to write prompt manually */}
            <button className="btn btn-secondary" onClick={() => setRecorderState('completed')}>
              ✍️ Write Text
            </button>
          </>
        )}

        {recorderState === 'recording' && (
          <motion.button
            className="btn btn-danger btn-pulse"
            onClick={stopRecording}
            animate={{ boxShadow: ['0 0 0 0 rgba(255, 107, 107, 0.4)', '0 0 0 15px rgba(255, 107, 107, 0)', '0 0 0 0 rgba(255, 107, 107, 0.4)'] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <Square size={18} /> Stop Recording
          </motion.button>
        )}

        {recorderState === 'completed' && (
          <>
            <button className="btn btn-primary" onClick={handleAnalyzeClick}>
              <Sparkles size={18} /> Analyze My Speech
            </button>
            <button className="btn btn-secondary" onClick={tryAgain}>
              <RotateCcw size={18} /> Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SpeechRecorder;

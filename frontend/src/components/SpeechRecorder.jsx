import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { transcribeAudio } from '../utils/api';

export function SpeechRecorder({ topic, targetDuration, onBack, onAnalyze, selectedLanguage }) {
  const [recorderState, setRecorderState] = useState('idle'); // idle | countdown | recording | completed
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(targetDuration);
  const [actualDuration, setActualDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

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
  const mediaRecorderRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopLocalStream();
    };
  }, []);

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

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

  const startRecording = async () => {
    setRecorderState('recording');
    setEditableTranscript('');
    setAudioBlob(null);
    audioChunksRef.current = [];
    startListening(selectedLanguage);

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
        setAudioBlob(blob);
        stopLocalStream();

        // Automate transcription and submit immediately
        await autoTranscribeAndSubmit(blob);
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
    }
  };

  const stopRecording = () => {
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
    setRecorderState('completed');
    let finalTranscript = '';
    
    try {
      const whisperHint = selectedLanguage ? selectedLanguage.split('-')[0] : '';
      const response = await transcribeAudio(blob, whisperHint);
      if (response && response.text) {
        finalTranscript = response.text;
        setEditableTranscript(response.text);
      }
    } catch (err) {
      console.error('Whisper auto-transcription failed, falling back to Web Speech API:', err);
      // Fallback
      finalTranscript = transcript || editableTranscript;
    } finally {
      setIsTranscribing(false);
    }

    const finalCleanText = finalTranscript.trim();
    const wordCount = finalCleanText.split(/\s+/).filter(Boolean).length;
    
    if (wordCount < 10) {
      alert('⚠️ Speech too short or no audio detected. You can edit/retry or type manually.');
      return;
    }

    onAnalyze({
      transcript: finalCleanText,
      actualDuration: actualDurationRef.current || 1,
    });
  };

  const tryAgain = () => {
    resetTranscript();
    setEditableTranscript('');
    setAudioBlob(null);
    setIsTranscribing(false);
    setTimeLeft(targetDuration);
    setActualDuration(0);
    actualDurationRef.current = 0;
    setRecorderState('idle');
  };

  const handleAnalyzeClick = () => {
    const finalCleanText = editableTranscript.trim();
    const wordCount = finalCleanText.split(/\s+/).filter(Boolean).length;
    
    if (wordCount === 0) {
      alert('⚠️ No speech detected. Please record and speak to generate a transcript.');
      return;
    }
    if (wordCount < 10) {
      alert('⚠️ Speech too short! Please record and speak a longer response (at least 10 words).');
      return;
    }
    
    onAnalyze({
      transcript: finalCleanText,
      actualDuration: actualDurationRef.current || 1,
    });
  };

  const size = 130;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressRatio = timeLeft / targetDuration;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const wordCount = editableTranscript.trim().split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  return (
    <div className="recorder-card">
      <AnimatePresence>
        {recorderState === 'countdown' && (
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
              padding: '2rem',
              textAlign: 'center'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div style={{ border: '4px solid #ffffff', padding: '3rem 2rem', backgroundColor: '#000000', width: '100%', maxWidth: '600px', boxShadow: '8px 8px 0px 0px #ffffff' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Get ready to speak about:</span>
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

      {/* Top Details */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        {recorderState === 'idle' && (
          <button className="btn-back-ghost" onClick={onBack}>
            <span className="material-symbols-outlined text-sm">arrow_back</span> BACK
          </button>
        )}
        <div style={{ flexGrow: recorderState === 'idle' ? 0 : 1, textAlign: recorderState === 'idle' ? 'right' : 'center' }}>
          <span className="winner-category-tag">{topic.category}</span>
        </div>
      </div>

      <h1 className="recorder-topic-title">"{topic.topic}"</h1>

      {/* Dynamic visualizer */}
      {recorderState === 'recording' && (
        <div className="audio-visualizer-container">
          {audioLevels.map((lvl, index) => (
            <div
              key={index}
              className="visualizer-bar"
              style={{
                height: `${Math.max(4, lvl * 50)}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* Timer */}
      <div className="timer-container">
        <svg className="timer-circle-svg" width={size} height={size}>
          <circle
            className="timer-circle-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
          />
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
          <span className="timer-val">{formatTime(timeLeft)}</span>
          <span className="timer-label">
            {recorderState === 'idle' && 'READY'}
            {recorderState === 'recording' && 'REMAINING'}
            {recorderState === 'completed' && 'DONE!'}
          </span>
        </div>
      </div>

      {/* Transcript Box */}
      <div className="transcript-wrapper">
        <div className="transcript-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>TRANSCRIPT BOX</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span className="material-symbols-outlined text-xs">lock</span> READ ONLY
          </span>
        </div>
        <textarea
          className="transcript-body"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            resize: 'none',
            fontFamily: 'var(--font-body)'
          }}
          readOnly={true}
          value={isTranscribing ? 'Transcribing audio via Groq Whisper... Please wait.' : editableTranscript}
          placeholder={
            recorderState === 'recording'
              ? 'Listening... Start speaking into your mic now!'
              : 'Recorded speech will appear here automatically once recording ends.'
          }
        />
        {interimTranscript && (
          <p style={{ fontStyle: 'italic', opacity: 0.6, fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {interimTranscript}
          </p>
        )}
        <div className="transcript-meta">
          <span>WORDS: <strong style={{ color: 'var(--text-primary)' }}>{wordCount}</strong></span>
          <span>WPM: <strong style={{ color: 'var(--text-primary)' }}>{wpm}</strong></span>
        </div>
      </div>

      {/* Error warnings */}
      {!isSupported && <div style={{ color: 'var(--accent-coral)', fontWeight: 700, fontSize: '0.85rem' }}>⚠️ {speechError}</div>}
      {isSupported && speechError && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', border: '2px solid #ffffff', padding: '0.75rem', width: '100%', textAlign: 'left' }}>
          ⚠️ {speechError}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', flexWrap: 'wrap' }}>
        {recorderState === 'idle' && (
          <button className="btn btn-primary" onClick={startCountdown} disabled={!isSupported}>
            <span className="material-symbols-outlined text-sm">mic</span> START RECORDING
          </button>
        )}

        {recorderState === 'recording' && (
          <button className="btn btn-primary" onClick={stopRecording} style={{ borderColor: 'var(--accent-coral)' }}>
            <span className="material-symbols-outlined text-sm">stop</span> STOP RECORDING
          </button>
        )}

        {recorderState === 'completed' && (
          <>
            {isTranscribing && (
              <div style={{ width: '100%', padding: '1rem', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem' }}>
                ⚡ Auto-transcribing speech audio...
              </div>
            )}
            {!isTranscribing && (
              <>
                <button className="btn btn-primary" onClick={handleAnalyzeClick}>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span> 
                  ANALYZE MY SPEECH
                </button>
                <button className="btn btn-secondary" onClick={tryAgain}>
                  <span className="material-symbols-outlined text-sm">rotate_left</span> TRY AGAIN
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SpeechRecorder;

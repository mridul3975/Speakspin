import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioLevel } from '../../hooks/useAudioLevel';
import { playTick, playHorn } from '../../utils/battleAudio';
import { transcribeAudio } from '../../utils/api';

export function BattleRecorder({ user, opponent, topic, duration, opponentSpeaking, onFinishSpeech }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [actualDuration, setActualDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const hasSubmittedRef = useRef(false);
  const actualDurationRef = useRef(0);

  const {
    transcript,
    isSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const { audioLevels } = useAudioLevel(true);

  const timerRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Sync transcription live
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  // Audio trigger countdown beep chimes
  useEffect(() => {
    if (timeLeft <= 3 && timeLeft > 0) {
      playTick();
    }
    if (timeLeft === 0) {
      playHorn();
    }
  }, [timeLeft]);

  // Start recording on mount
  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  const startRecordingSession = async () => {
    setEditableTranscript('');
    audioChunksRef.current = [];
    hasSubmittedRef.current = false;

    try {
      startListening();
    } catch (e) {
      console.warn('Speech recognition warning:', e);
    }

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

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        stopLocalStream();
        handleAutoSubmit(blob);
      };

      mediaRecorder.start(250);
    } catch (err) {
      console.warn('Microphone hardware denied, falling back to Web Speech/Textarea only:', err);
    }

    // Set duration countdown timer
    setTimeLeft(duration);
    setActualDuration(0);
    actualDurationRef.current = 0;

    timerRef.current = setInterval(() => {
      actualDurationRef.current += 1;
      setActualDuration(actualDurationRef.current);
      if (actualDurationRef.current >= duration) {
        clearInterval(timerRef.current);
        stopRecordingSession();
      }
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
  };

  const stopRecordingSession = () => {
    try {
      stopListening();
    } catch (e) {}

    let hasMediaRecorder = false;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        hasMediaRecorder = true;
      } catch (e) {
        console.error(e);
      }
    }
    if (timerRef.current) clearInterval(timerRef.current);

    if (!hasMediaRecorder) {
      handleAutoSubmit(null);
    } else {
      setTimeout(() => {
        if (!hasSubmittedRef.current) {
          console.warn('Timeout fallback triggered: submitting battle score via transcript.');
          handleAutoSubmit(null);
        }
      }, 1500);
    }
  };

  const stopLocalStream = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  const handleAutoSubmit = async (blob) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    let finalTranscript = editableTranscript.trim();
    setIsTranscribing(true);

    try {
      if (blob && blob.size > 8000 && actualDurationRef.current >= 2) {
        const response = await transcribeAudio(blob);
        if (response && response.text) {
          finalTranscript = response.text;
        }
      }
    } catch (err) {
      console.warn('Whisper transcription failed, falling back to Web Speech:', err);
    } finally {
      setIsTranscribing(false);
    }

    const finalCleanText = finalTranscript.trim();
    const wordCount = finalCleanText.split(/\s+/).filter(Boolean).length;

    onFinishSpeech({
      blob,
      transcript: finalCleanText,
      actualDuration: actualDurationRef.current || 1,
      wordCount
    });
  };

  const wordCount = editableTranscript.trim().split(/\s+/).filter(Boolean).length;
  const wpm = actualDuration > 0 ? Math.round((wordCount / actualDuration) * 60) : 0;

  // SVG timer ring values
  const size = 100;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressRatio = timeLeft / duration;
  const strokeDashoffset = circumference - progressRatio * circumference;

  if (!hasStarted) {
    return (
      <div className="setup-container" style={{ margin: '3rem auto', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ border: '4px solid #ffffff', padding: '3rem 2rem', backgroundColor: '#000000', boxShadow: '8px 8px 0px 0px #ffffff' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', animation: 'pulse 1s infinite' }}>🎤</span>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', margin: '0 0 1.5rem 0' }}>
            READY TO RECORD?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '2rem' }}>
            Tap the button below to initialize your microphone stream and start speaking on your topic!
          </p>
          <button
            onClick={() => {
              setHasStarted(true);
              startRecordingSession();
            }}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1.1rem',
              fontSize: '1.2rem',
              backgroundColor: 'var(--accent-teal)',
              borderColor: 'var(--accent-teal)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 900
            }}
          >
            🔥 START SPEAKING!
          </button>
        </div>
      </div>
    );
  }

  if (isTranscribing) {
    return (
      <div className="setup-container" style={{ margin: '3rem auto', maxWidth: '500px', textAlign: 'center' }}>
        <div style={{ border: '4px solid #ffffff', padding: '3rem 2rem', backgroundColor: '#000000', boxShadow: '8px 8px 0px 0px #ffffff' }}>
          <div style={{ display: 'inline-block', fontSize: '3rem', animation: 'spin 3s linear infinite', marginBottom: '1.5rem' }}>
            <span className="material-symbols-outlined text-5xl">sync</span>
          </div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>
            TRANSCRIBING AUDIO
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            AI is analyzing your voice stream to generate a highly accurate speech transcript. Please wait...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="recorder-card" style={{ maxWidth: '700px', margin: '1rem auto 2rem', padding: '1.5rem' }}>
      
      {/* Topic header banner */}
      <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
        ⚔️ TOPIC: "{topic}"
      </div>

      {/* TOP HALF: YOUR SIDE */}
      <div style={{ border: '2px solid #ffffff', padding: '1.25rem', backgroundColor: '#000000', marginBottom: '1rem', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontSize: '1.25rem', marginRight: '0.35rem' }}>{user.avatar}</span>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '1rem' }}>
              {user.playerName} (YOU)
            </span>
          </div>

          {/* Mini Timer Ring */}
          <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={size / 2} cy={size / 2} r={radius} stroke="#111" strokeWidth={strokeWidth} fill="transparent" />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="var(--accent-teal)"
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.5s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: 'var(--font-heading)' }}>{timeLeft}s</span>
              <span style={{ fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', opacity: 0.6 }}>left</span>
            </div>
          </div>
        </div>

        {/* Input Textarea Fallback */}
        <textarea
          className="transcript-body"
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          placeholder="Speak into your mic, or type your speech here if the microphone is locked..."
          style={{
            width: '100%',
            minHeight: '90px',
            backgroundColor: '#07070f',
            border: '1px solid #333333',
            color: '#ffffff',
            padding: '0.75rem',
            resize: 'none',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            marginBottom: '0.5rem'
          }}
        />

        {/* Live Metrics */}
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          <span>WORDS: <strong style={{ color: '#ffffff' }}>{wordCount}</strong></span>
          <span>SPEED: <strong style={{ color: '#ffffff' }}>{wpm} WPM</strong></span>
        </div>
      </div>

      {/* MIDDLE DIVIDER: VS BADGE & AUDIO VISUALIZERS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 1fr', alignItems: 'center', margin: '1rem 0' }}>
        
        {/* Your visualizer */}
        <div style={{ display: 'flex', gap: '2px', height: '24px', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
          {audioLevels.map((lvl, idx) => (
            <div key={idx} style={{ width: '3px', height: `${Math.max(3, lvl * 24)}px`, backgroundColor: 'var(--accent-teal)', transition: 'height 0.1s ease' }} />
          ))}
        </div>

        <div style={{ textAlign: 'center', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '0.85rem', color: 'var(--accent-coral)' }}>VS</div>

        {/* Opponent visualizer simulation */}
        <div style={{ display: 'flex', gap: '2px', height: '24px', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                width: '3px',
                height: opponentSpeaking ? `${Math.max(3, Math.random() * 20)}px` : '3px',
                backgroundColor: opponentSpeaking ? 'var(--accent-coral)' : '#333333',
                transition: 'height 0.15s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM HALF: OPPONENT SIDE */}
      <div style={{ border: '2px solid #555555', padding: '1.25rem', backgroundColor: '#07070f', opacity: 0.85 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ fontSize: '2.5rem', filter: opponentSpeaking ? 'drop-shadow(0 0 8px var(--accent-coral))' : 'none' }}>
            {opponent.avatar}
          </div>
          <div>
            <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.9rem', margin: 0 }}>
              {opponent.name}
            </h4>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: opponentSpeaking ? 'var(--accent-coral)' : 'var(--text-secondary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.2rem', marginTop: '0.2rem' }}>
              <span className="material-symbols-outlined text-xs" style={{ animation: opponentSpeaking ? 'pulse 1s infinite' : 'none' }}>
                {opponentSpeaking ? 'mic' : 'mic_off'}
              </span>
              {opponentSpeaking ? 'SPEAKING...' : 'FINISHED RECORDING'}
            </span>
          </div>
        </div>
      </div>

      {/* Stop early panel */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
        <button
          onClick={stopRecordingSession}
          className="btn btn-secondary"
          style={{ borderColor: 'var(--accent-coral)', color: 'var(--accent-coral)' }}
        >
          <span className="material-symbols-outlined text-sm">stop</span> SUBMIT EARLY
        </button>
      </div>

    </div>
  );
}

export default BattleRecorder;

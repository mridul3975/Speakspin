import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { transcribeAudio, translateTopic } from '../utils/api';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
export function SpeechRecorder({ topic, targetDuration, onBack, onAnalyze, selectedLanguage }) {
  const [recorderState, setRecorderState] = useState('idle'); // idle | countdown | recording | completed
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(targetDuration);
  const [actualDuration, setActualDuration] = useState(0);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [translatedTopic, setTranslatedTopic] = useState(topic.topic);

  useEffect(() => {
    let active = true;
    if (selectedLanguage && !selectedLanguage.startsWith('en')) {
      translateTopic(topic.topic, selectedLanguage).then((res) => {
        if (active && res && res.translated) {
          setTranslatedTopic(res.translated);
        }
      });
    } else {
      setTranslatedTopic(topic.topic);
    }
    return () => {
      active = false;
    };
  }, [topic, selectedLanguage]);

  const timerRef = useRef(null);
  const actualDurationRef = useRef(0);
  const mediaRecorderRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const latestTranscriptRef = useRef('');

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

  const { audioLevels } = useAudioLevel(recorderState === 'recording', localStreamRef.current);

  useEffect(() => {
    if (transcript) {
      latestTranscriptRef.current = transcript;
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

  const hasStartedRecordingRef = useRef(false);
  const hasStoppedRecordingRef = useRef(false);

  // Safely trigger startRecording when countdown reaches 0
  useEffect(() => {
    if (recorderState === 'countdown' && countdown === 0) {
      if (!hasStartedRecordingRef.current) {
        hasStartedRecordingRef.current = true;
        startRecording();
      }
    }
  }, [recorderState, countdown]);

  // Manage countdown interval
  useEffect(() => {
    if (recorderState !== 'countdown') return;

    setCountdown(3);
    hasStartedRecordingRef.current = false;
    
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [recorderState]);

  // Safely trigger stopRecording when timeLeft reaches 0
  useEffect(() => {
    if (recorderState === 'recording' && timeLeft === 0) {
      if (!hasStoppedRecordingRef.current) {
        hasStoppedRecordingRef.current = true;
        stopRecording();
      }
    }
  }, [recorderState, timeLeft]);

  // Manage recording timer interval
  useEffect(() => {
    if (recorderState !== 'recording') return;

    setTimeLeft(targetDuration);
    hasStoppedRecordingRef.current = false;
    actualDurationRef.current = 0;
    setActualDuration(0);

    timerRef.current = setInterval(() => {
      actualDurationRef.current += 1;
      setActualDuration(actualDurationRef.current);
      setTimeLeft((prev) => Math.max(0, prev - 1));
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
    latestTranscriptRef.current = '';
    setAudioBlob(null);
    audioChunksRef.current = [];

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
      startListening(selectedLanguage);
    } catch (err) {
      console.warn('Microphone stream access warning, falling back to Web Speech only:', err);
      startListening(selectedLanguage);
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
    } else {
      // If mediaRecorder was never active, trigger auto submit directly
      autoTranscribeAndSubmit(null);
    }
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const autoTranscribeAndSubmit = async (blob) => {
    setIsTranscribing(true);
    setRecorderState('completed');
    let finalTranscript = '';
    
    try {
      if (blob && blob.size > 1000) {
        const whisperHint = selectedLanguage ? selectedLanguage.split('-')[0] : '';
        const response = await transcribeAudio(blob, whisperHint);
        if (response && response.text && response.text.trim()) {
          finalTranscript = response.text.trim();
        }
      }
    } catch (err) {
      console.warn('Whisper auto-transcription note (falling back to Web Speech API):', err.message);
    } finally {
      setIsTranscribing(false);
    }

    // If Whisper didn't return text, use Web Speech transcript from ref
    if (!finalTranscript) {
      finalTranscript = latestTranscriptRef.current || transcript || editableTranscript;
    }

    const finalCleanText = (finalTranscript || '').trim();
    setEditableTranscript(finalCleanText);
    latestTranscriptRef.current = finalCleanText;
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
    latestTranscriptRef.current = '';
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
    <Card className="w-full max-w-[600px] border-4 border-white bg-black rounded-none shadow-[8px_8px_0px_0px_#ffffff] p-6 text-white font-body relative overflow-hidden">
      <CardContent className="p-0 flex flex-col gap-6">
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
              <h2 className="recorder-topic-title" style={{ margin: '1rem 0 2rem 0' }}>
                {translatedTopic === topic.topic ? `"${topic.topic}"` : `"${translatedTopic}"`}
                {translatedTopic !== topic.topic && (
                  <div style={{ fontSize: '1rem', fontWeight: 'normal', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    (English: "{topic.topic}")
                  </div>
                )}
              </h2>
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
          <Button variant="ghost" onClick={onBack} className="text-white hover:text-white hover:bg-[#1a1a1a] rounded-none px-2 font-black">
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> BACK
          </Button>
        )}
        <div style={{ flexGrow: recorderState === 'idle' ? 0 : 1, textAlign: recorderState === 'idle' ? 'right' : 'center' }}>
          <span className="winner-category-tag">{topic.category}</span>
        </div>
      </div>

      <h1 className="recorder-topic-title" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <span>{translatedTopic === topic.topic ? `"${topic.topic}"` : `"${translatedTopic}"`}</span>
        {translatedTopic !== topic.topic && (
          <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.6 }}>
            (English: "{topic.topic}")
          </span>
        )}
      </h1>

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
            {recorderState === 'completed' ? (
              <><span className="material-symbols-outlined text-xs">edit</span> EDITABLE</>
            ) : (
              <><span className="material-symbols-outlined text-xs">lock</span> READ ONLY</>
            )}
          </span>
        </div>
        <Textarea
          className="w-full min-h-[150px] bg-transparent border-none outline-none text-white resize-none font-body text-base placeholder:text-[#666666] focus-visible:ring-0 px-0"
          readOnly={recorderState !== 'completed'}
          value={isTranscribing ? 'Transcribing audio via Groq Whisper... Please wait.' : editableTranscript}
          onChange={(e) => {
            setEditableTranscript(e.target.value);
            latestTranscriptRef.current = e.target.value;
          }}
          placeholder={
            recorderState === 'recording'
              ? 'Listening... Start speaking into your mic now!'
              : 'Recorded speech will appear here automatically once recording ends. You can also edit or type manually.'
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
          <Button onClick={startCountdown} disabled={!isSupported} className="bg-white hover:bg-[#e0e0e0] text-black font-black uppercase tracking-widest rounded-none border-2 border-white px-6 h-12">
            <span className="material-symbols-outlined text-sm mr-2">mic</span> START RECORDING
          </Button>
        )}

        {recorderState === 'recording' && (
          <Button onClick={stopRecording} className="bg-transparent hover:bg-[#111111] text-[#ff5555] font-black uppercase tracking-widest rounded-none border-2 border-[#ff5555] px-6 h-12">
            <span className="material-symbols-outlined text-sm mr-2">stop</span> STOP RECORDING
          </Button>
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
                <Button onClick={handleAnalyzeClick} className="bg-white hover:bg-[#e0e0e0] text-black font-black uppercase tracking-widest rounded-none border-2 border-white px-6 h-12">
                  <span className="material-symbols-outlined text-sm mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span> 
                  ANALYZE MY SPEECH
                </Button>
                <Button variant="outline" onClick={tryAgain} className="bg-transparent hover:bg-[#111111] text-[#888888] font-black uppercase tracking-widest rounded-none border-2 border-[#333333] px-6 h-12">
                  <span className="material-symbols-outlined text-sm mr-2">rotate_left</span> TRY AGAIN
                </Button>
              </>
            )}
          </>
        )}
      </div>
      </CardContent>
    </Card>
  );
}

export default SpeechRecorder;

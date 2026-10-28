import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Mic, RotateCcw, Square, ArrowRight } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioLevel } from '../hooks/useAudioLevel';
import { transcribeAudio, translateTopic } from '../utils/api';
import { BackButton, GameButton, StatusNotice } from './game/GameUI';

export function SpeechRecorder({ topic, targetDuration, onBack, onAnalyze, selectedLanguage, initialTranscript = '', initialDuration = 0 }) {
  const duration = Math.max(1, Number(targetDuration) || 60);
  const [phase, setPhase] = useState(initialTranscript ? 'completed' : 'idle');
  const [countdown, setCountdown] = useState(3);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [actualDuration, setActualDuration] = useState(initialDuration);
  const [editableTranscript, setEditableTranscript] = useState(initialTranscript);
  const [translatedTopic, setTranslatedTopic] = useState(topic.topic);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);
  const mountedRef = useRef(true);
  const streamRef = useRef(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef(initialTranscript);
  const actualDurationRef = useRef(initialDuration);
  const startedAtRef = useRef(0);
  const stopRef = useRef(null);
  const sessionRef = useRef(0);
  const recordingRef = useRef(false);
  const transcribingSessionRef = useRef(null);
  const stopTimeoutRef = useRef(null);
  const { transcript, error: speechError, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();
  const { audioLevels } = useAudioLevel(phase === 'recording', stream);

  const releaseStream = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    if (mountedRef.current) setStream(null);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      sessionRef.current += 1;
      recordingRef.current = false;
      clearTimeout(stopTimeoutRef.current);
      if (recorderRef.current) {
        recorderRef.current.onstop = null;
        try {
          if (recorderRef.current.state !== 'inactive') recorderRef.current.stop();
        } catch {
          // Tracks are still released below if the recorder already became unavailable.
        }
      }
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    let active = true;
    setTranslatedTopic(topic.topic);
    if (selectedLanguage && !selectedLanguage.startsWith('en')) {
      translateTopic(topic.topic, selectedLanguage).then(result => {
        if (active && result?.translated) setTranslatedTopic(result.translated);
      }).catch(() => {});
    }
    return () => { active = false; };
  }, [topic.topic, selectedLanguage]);

  useEffect(() => {
    if (transcript && (phase === 'recording' || phase === 'transcribing')) {
      transcriptRef.current = transcript;
      if (phase === 'recording') setEditableTranscript(transcript);
    }
  }, [transcript, phase]);

  const finishTranscription = async (blob, session) => {
    if (!mountedRef.current || session !== sessionRef.current || transcribingSessionRef.current === session) return;
    transcribingSessionRef.current = session;
    setPhase('transcribing');
    let finalTranscript = '';
    let transcriptionFailed = false;
    try {
      if (blob && blob.size > 1000) {
        let timeout;
        const result = await Promise.race([
          transcribeAudio(blob, selectedLanguage?.split('-')[0] || ''),
          new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('transcription-timeout')), 25000); }),
        ]).finally(() => clearTimeout(timeout));
        finalTranscript = result?.text?.trim() || '';
      }
    } catch {
      transcriptionFailed = true;
    }
    if (!mountedRef.current || session !== sessionRef.current) return;
    finalTranscript = finalTranscript || transcriptRef.current.trim();
    transcriptRef.current = finalTranscript;
    setEditableTranscript(finalTranscript);
    setPhase('completed');
    if (!finalTranscript) setError('We couldn’t capture a transcript. Check your microphone and try another take, or enter the words you spoke below.');
    else if (transcriptionFailed) setError('Audio transcription was unavailable. Your live captions are saved below; check them before scoring.');
  };

  const beginRecording = () => {
    if (recordingRef.current) return;
    recordingRef.current = true;
    const session = sessionRef.current;
    chunksRef.current = [];
    try {
      if (typeof MediaRecorder !== 'undefined') {
        const mimeType = ['audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
        const recorder = new MediaRecorder(streamRef.current, mimeType ? { mimeType } : undefined);
        recorderRef.current = recorder;
        recorder.ondataavailable = event => { if (event.data?.size) chunksRef.current.push(event.data); };
        recorder.onstop = () => {
          clearTimeout(stopTimeoutRef.current);
          if (!mountedRef.current || session !== sessionRef.current || transcribingSessionRef.current === session) return;
          if (recordingRef.current) actualDurationRef.current = Math.min(duration, Math.max(1, Math.round((performance.now() - startedAtRef.current) / 1000)));
          recordingRef.current = false;
          if (mountedRef.current && session === sessionRef.current) setActualDuration(actualDurationRef.current);
          stopListening();
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
          releaseStream();
          finishTranscription(blob, session);
        };
        recorder.onerror = () => {
          if (mountedRef.current && session === sessionRef.current) setError('Recording was interrupted. We’ll keep any words already captured so you can review them.');
          stopRef.current?.();
        };
        recorder.start(250);
      } else if (!isSupported) throw new Error('unsupported');
      if (isSupported) startListening(selectedLanguage);
      actualDurationRef.current = 0;
      setActualDuration(0);
      startedAtRef.current = performance.now();
      setPhase('recording');
    } catch {
      recordingRef.current = false;
      releaseStream();
      setPhase('idle');
      setError('Recording is unavailable in this browser. Try a recent version of Chrome, Edge, or Safari.');
    }
  };

  useEffect(() => {
    if (phase !== 'countdown') return;
    if (countdown === 0) { beginRecording(); return; }
    const timeout = setTimeout(() => setCountdown(value => value - 1), 1000);
    return () => clearTimeout(timeout);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== 'recording') return;
    const timer = setInterval(() => {
      const elapsed = Math.min(duration, Math.floor((performance.now() - startedAtRef.current) / 1000));
      actualDurationRef.current = elapsed;
      setActualDuration(elapsed);
      setTimeLeft(Math.max(0, duration - elapsed));
      if (elapsed >= duration) stopRef.current?.();
    }, 200);
    return () => clearInterval(timer);
  }, [phase, duration]);

  const prepareRound = async () => {
    setError('');
    setPhase('preparing');
    resetTranscript();
    transcriptRef.current = '';
    setEditableTranscript('');
    const session = ++sessionRef.current;
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const nextStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current || session !== sessionRef.current) { nextStream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = nextStream;
      setStream(nextStream);
      setTimeLeft(duration);
      setCountdown(3);
      setPhase('countdown');
    } catch (reason) {
      if (!mountedRef.current || session !== sessionRef.current) return;
      setPhase('idle');
      setError(reason.name === 'NotAllowedError' ? 'Microphone access is blocked. Allow the microphone in your browser’s site settings, then try again.' : 'We couldn’t connect to a microphone. Check that one is available, then try again.');
    }
  };

  const stopRecording = () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    actualDurationRef.current = Math.min(duration, Math.max(1, Math.round((performance.now() - startedAtRef.current) / 1000)));
    setActualDuration(actualDurationRef.current);
    stopListening();
    setPhase('transcribing');
    const session = sessionRef.current;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      stopTimeoutRef.current = setTimeout(() => {
        if (session !== sessionRef.current || !mountedRef.current) return;
        releaseStream();
        finishTranscription(null, session);
      }, 2500);
      try {
        recorderRef.current.stop();
      } catch {
        clearTimeout(stopTimeoutRef.current);
        releaseStream();
        finishTranscription(null, session);
      }
    } else {
      releaseStream();
      finishTranscription(null, session);
    }
  };
  stopRef.current = stopRecording;

  const retry = () => {
    sessionRef.current += 1;
    recordingRef.current = false;
    setError('');
    setEditableTranscript('');
    transcriptRef.current = '';
    resetTranscript();
    setTimeLeft(duration);
    setActualDuration(0);
    actualDurationRef.current = 0;
    recorderRef.current = null;
    setPhase('idle');
  };

  const wordCount = editableTranscript.trim().split(/\s+/).filter(Boolean).length;
  const analyze = () => {
    if (wordCount < 10) { setError('Give the judge at least 10 words to work with. Review the transcript or try another take.'); return; }
    setError('');
    onAnalyze({ transcript: editableTranscript.trim(), actualDuration: actualDurationRef.current || 1 });
  };
  const formatTime = seconds => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const canLeave = phase === 'idle' || phase === 'preparing' || phase === 'completed';
  const status = phase === 'idle' ? 'Your mic check comes first' : phase === 'preparing' ? 'Connecting your microphone…' : phase === 'countdown' ? 'Microphone ready' : phase === 'recording' ? 'You’re on the mic' : phase === 'transcribing' ? 'Preparing your transcript…' : 'Round complete';

  return (
    <section className="screen-stack solo-recorder">
      <div className="recorder-topline">{canLeave && <BackButton onClick={onBack}>Leave practice</BackButton>}<span className="topic-category">{topic.category}</span></div>
      <div className="game-panel recording-stage">
        <h1 className="topic-title" dir="auto">{translatedTopic}</h1>
        {translatedTopic !== topic.topic && <p className="translation-original">Original: {topic.topic}</p>}
        <div className={`recording-status${phase === 'recording' ? ' is-live' : ''}`} role="status">{phase === 'completed' ? <Check size={16} /> : <Mic size={16} />}{status}</div>
        {phase === 'countdown' ? <div className="round-countdown" role="status" aria-label={`Speak in ${countdown}`}>{countdown || 'Go'}</div> : <div className="recording-timer">
          <span className="recording-time">{phase === 'completed' ? formatTime(actualDuration) : formatTime(timeLeft)}</span>
          <span>{phase === 'completed' ? 'spoken' : phase === 'recording' ? 'remaining' : 'round time'}</span>
        </div>}
        <progress className="recording-progress" max={duration} value={phase === 'completed' ? actualDuration : duration - timeLeft} aria-label="Round time elapsed" />
        {phase === 'recording' && <div className="input-level" aria-label="Microphone input level">{audioLevels.map((level, index) => <span key={index} className="input-level-bar" style={{ height: `${Math.max(3, level * 44)}px` }} />)}</div>}
        <div className="game-actions">
          {(phase === 'idle' || phase === 'preparing') && <GameButton onClick={prepareRound} disabled={phase === 'preparing'}><Mic size={18} />{phase === 'preparing' ? 'Checking microphone…' : 'Check mic & start'}</GameButton>}
          {phase === 'recording' && <GameButton variant="danger" onClick={stopRecording}><Square size={16} />Finish speaking</GameButton>}
          {phase === 'completed' && <><GameButton onClick={analyze}>Score this round <ArrowRight size={18} /></GameButton><GameButton variant="secondary" onClick={retry}><RotateCcw size={17} />Try another take</GameButton></>}
        </div>
        {phase === 'idle' && <p className="recording-help">We’ll check microphone access, count you in, then start the clock.</p>}
        {phase === 'completed' && <p className="recording-help">Check your transcript below, then send it to the judge.</p>}
        {phase === 'transcribing' && <p className="recording-help" role="status">Your round is saved in this session. Stay here while we turn it into text.</p>}
      </div>
      {error && <StatusNotice tone="error">{error}</StatusNotice>}
      {phase === 'recording' && speechError && <StatusNotice>Live captions are unavailable. Your recorded audio will still be transcribed after the round.</StatusNotice>}
      {(phase === 'recording' || phase === 'completed') && <details className="feedback-details transcript-detail" open={phase === 'completed'}>
        <summary><span>{phase === 'completed' ? 'Review your transcript' : 'Live transcript'}</span><ChevronDown size={17} /></summary>
        <label className="sr-only" htmlFor="solo-transcript">Your speech transcript</label>
        <textarea id="solo-transcript" className="transcript-editor" dir="auto" readOnly={phase !== 'completed'} value={editableTranscript} onChange={event => { setEditableTranscript(event.target.value); transcriptRef.current = event.target.value; }} placeholder={phase === 'recording' ? 'Your words will appear here as you speak.' : 'Enter or correct the words you spoke.'} />
        <div className="transcript-meta"><span>{wordCount} words</span>{actualDuration > 0 && <span>{Math.round(wordCount / actualDuration * 60)} words/min</span>}</div>
      </details>}
    </section>
  );
}

export default SpeechRecorder;

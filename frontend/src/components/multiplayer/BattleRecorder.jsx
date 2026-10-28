import React, { useEffect, useRef, useState } from 'react';
import { Check, Mic, MicOff, Square } from 'lucide-react';
import { GameButton, LoadingState, PlayerAvatar, StatusNotice } from '../game/GameUI';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioLevel } from '../../hooks/useAudioLevel';
import { transcribeAudio, translateTopic } from '../../utils/api';
import { playTick, playHorn } from '../../utils/battleAudio';
import { prepareBattleMicrophone, takeBattleMicrophone } from './battleMicrophone';
export function BattleRecorder({
  user,
  opponent,
  topic,
  duration,
  opponentSpeaking,
  opponentSubmitted = false,
  onFinishSpeech,
  selectedLanguage,
  startAt
}) {
  const targetDuration = Number(duration) || 60;
  const [phase, setPhase] = useState('preparing');
  const [timeLeft, setTimeLeft] = useState(targetDuration);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [translatedTopic, setTranslatedTopic] = useState(topic);
  const [transcriptFallback, setTranscriptFallback] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const mounted = useRef(false);
  const recorder = useRef(null);
  const activeStream = useRef(null);
  const chunks = useRef([]);
  const latestTranscript = useRef('');
  const startedAt = useRef(null);
  const roundStartedAt = useRef(Number(startAt) || Date.now());
  const actualDurationRef = useRef(0);
  const timer = useRef(null);
  const finishing = useRef(false);
  const submitted = useRef(false);
  const onFinishRef = useRef(onFinishSpeech);
  onFinishRef.current = onFinishSpeech;
  const {
    transcript,
    isSupported,
    startListening,
    stopListening
  } = useSpeechRecognition();
  const speechRef = useRef({
    startListening,
    stopListening
  });
  speechRef.current = {
    startListening,
    stopListening
  };
  const {
    audioLevels
  } = useAudioLevel(phase === 'recording', stream);
  useEffect(() => {
    if (transcript) {
      latestTranscript.current = transcript;
      setWordCount(transcript.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [transcript]);
  useEffect(() => {
    let active = true;
    setTranslatedTopic(topic);
    if (selectedLanguage && !selectedLanguage.startsWith('en')) translateTopic(topic, selectedLanguage).then(result => {
      if (active && result?.translated) setTranslatedTopic(result.translated);
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [topic, selectedLanguage]);
  const closeStream = () => {
    activeStream.current?.getTracks().forEach(track => track.stop());
    activeStream.current = null;
    if (mounted.current) setStream(null);
  };
  const finish = async () => {
    if (finishing.current || submitted.current) return;
    finishing.current = true;
    clearInterval(timer.current);
    speechRef.current.stopListening();
    setPhase('transcribing');
    const actualDuration = startedAt.current ? Math.min(targetDuration, Math.max(0, Math.round((Date.now() - startedAt.current) / 1000))) : 0;
    actualDurationRef.current = actualDuration;
    let blob = null;
    if (recorder.current && recorder.current.state !== 'inactive') {
      const stopped = new Promise(resolve => {
        recorder.current.onstop = resolve;
      });
      recorder.current.stop();
      await stopped;
      blob = new Blob(chunks.current, {
        type: recorder.current.mimeType || 'audio/webm'
      });
    }
    closeStream();
    let finalText = latestTranscript.current.trim();
    if (blob?.size > 2000 && actualDuration >= 2) {
      let deadline;
      try {
        const response = await Promise.race([
          transcribeAudio(blob, selectedLanguage?.split('-')[0] || ''),
          new Promise((_, reject) => { deadline = setTimeout(() => reject(new Error('Transcription timed out')), 20000); })
        ]);
        if (response?.text?.trim() && !response.text.startsWith('This is a mock transcription')) finalText = response.text.trim();
      } catch {/* A live transcript remains valid when audio transcription is unavailable. */}
      finally { clearTimeout(deadline); }
    }
    if (!mounted.current || submitted.current) return;
    if (!finalText) {
      finishing.current = false;
      setError('We couldn’t transcribe your recording. Add the words you spoke below, or submit an empty response.');
      setPhase('review');
      return;
    }
    submitted.current = true;
    onFinishRef.current({
      blob,
      transcript: finalText,
      actualDuration,
      wordCount: finalText.split(/\s+/).filter(Boolean).length
    });
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;
  const begin = async () => {
    if (startedAt.current || finishing.current || submitted.current) return;
    setError('');
    setPhase('preparing');
    try {
      let input = takeBattleMicrophone();
      if (!input) {
        await prepareBattleMicrophone();
        input = takeBattleMicrophone();
      }
      if (!mounted.current) {
        input?.getTracks().forEach(track => track.stop());
        return;
      }
      if (!input) throw new Error('Microphone unavailable');
      activeStream.current = input;
      if (typeof MediaRecorder === 'undefined') throw new Error('Recording unsupported');
      setStream(input);
      const mimeType = ['audio/webm', 'audio/mp4'].find(type => MediaRecorder.isTypeSupported(type));
      recorder.current = mimeType ? new MediaRecorder(input, {
        mimeType
      }) : new MediaRecorder(input);
      chunks.current = [];
      recorder.current.ondataavailable = event => {
        if (event.data?.size) chunks.current.push(event.data);
      };
      recorder.current.start(250);
      startedAt.current = Date.now();
      if (isSupported) {
        try { speechRef.current.startListening(selectedLanguage); }
        catch { /* Audio recording can still be transcribed after the round. */ }
      }
      setPhase('recording');
      const update = () => {
        const remaining = Math.max(0, Math.ceil((roundStartedAt.current + targetDuration * 1000 - Date.now()) / 1000));
        setTimeLeft(previous => {
          if (previous !== remaining && remaining > 0 && remaining <= 3) playTick();
          return remaining;
        });
        if (remaining === 0) {
          clearInterval(timer.current);
          playHorn();
          finishRef.current();
        }
      };
      timer.current = setInterval(update, 250);
      update();
    } catch (cause) {
      closeStream();
      setPhase('error');
      setError(cause.name === 'NotAllowedError' ? 'Microphone access is blocked. Allow access in your browser, then retry.' : 'We couldn’t start your microphone. Check your device, then retry.');
    }
  };
  const beginRef = useRef(begin);
  beginRef.current = begin;
  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    // Defer setup so the StrictMode rehearsal cannot consume the prepared stream.
    Promise.resolve().then(() => {
      if (!cancelled) beginRef.current();
    });
    return () => {
      cancelled = true;
      mounted.current = false;
      clearInterval(timer.current);
      speechRef.current.stopListening();
      if (recorder.current) {
        recorder.current.ondataavailable = null;
        recorder.current.onstop = null;
        if (recorder.current.state !== 'inactive') recorder.current.stop();
      }
      closeStream();
    };
  }, []);
  const manualSubmit = () => {
    if (submitted.current) return;
    submitted.current = true;
    const finalText = transcriptFallback.trim();
    onFinishRef.current({
      blob: null,
      transcript: finalText,
      actualDuration: actualDurationRef.current,
      wordCount: finalText ? finalText.split(/\s+/).length : 0
    });
  };
  if (phase === 'transcribing') return <LoadingState title="Saving your words" description="Preparing your transcript for the judge. Keep this window open." />;
  return <section className="game-panel battle-recorder">
    <div className="round-hud"><div className="round-hud-player"><PlayerAvatar avatar={user?.avatar} /><div><strong>{user?.playerName || 'You'}</strong><span>You</span></div></div><span className="versus-mark">VS</span><div className="round-hud-player round-hud-player--rival"><div><strong>{opponent?.name || 'Challenger'}</strong><span>{opponentSubmitted ? 'Submitted' : opponentSpeaking ? 'In their round' : 'Preparing'}</span></div><PlayerAvatar avatar={opponent?.avatar} rival /></div></div>
    <div className="recording-stage"><h1 dir="auto">{translatedTopic}</h1>{translatedTopic !== topic && <p className="subtle-copy">English: {topic}</p>}<div className={`round-timer${timeLeft <= 10 ? ' round-timer--urgent' : ''}`} aria-label={`${timeLeft} seconds remaining`}><strong>{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</strong><span>remaining</span></div><div className="audio-levels" aria-hidden="true">{audioLevels.map((level, index) => <span key={index} style={{
          height: `${Math.max(4, level * 48)}px`
        }} />)}</div><p className="round-status" role="status">{phase === 'recording' ? <><Mic size={17} />Microphone recording</> : phase === 'preparing' ? 'Starting your microphone…' : <><MicOff size={17} />Microphone stopped</>}</p></div>
    {error && <StatusNotice tone="error">{error}</StatusNotice>}
    {phase === 'error' && <div className="game-actions"><GameButton onClick={begin}>Retry microphone</GameButton><GameButton variant="secondary" onClick={manualSubmit}>Submit without speech</GameButton></div>}
    {phase === 'recording' && <><GameButton variant="danger" onClick={finish}><Square size={17} />Finish speaking</GameButton><details className="round-transcript"><summary>Live transcript <span>{wordCount} words</span></summary><p dir="auto">{transcript || (isSupported ? 'Your spoken words will appear here.' : 'A transcript will be prepared after the round.')}</p></details></>}
    {phase === 'review' && <div className="round-transcript"><label className="field-label" htmlFor="battle-transcript-fallback">Words you spoke</label><textarea id="battle-transcript-fallback" className="game-textarea" value={transcriptFallback} onChange={event => setTranscriptFallback(event.target.value)} dir="auto" /><GameButton onClick={manualSubmit}><Check size={17} />Submit response</GameButton></div>}
  </section>;
}
export default BattleRecorder;

import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  // Holds all accumulated text from previous sessions (before auto-restarts)
  const persistedTranscriptRef = useRef('');
  const activeInterimRef = useRef('');
  // Current complete transcript (persisted + current session final + interim)
  const transcriptRef = useRef('');
  const shouldListenRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Use Chrome, Edge, or Safari for speech recognition. Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[SpeechRecognition] Engine started listening.');
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event) => {
      let sessionFinal = '';
      let interim = '';

      for (let i = 0; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          sessionFinal += res[0].transcript + ' ';
        } else {
          interim += res[0].transcript;
        }
      }

      activeInterimRef.current = interim;
      const prefix = persistedTranscriptRef.current ? persistedTranscriptRef.current + ' ' : '';
      const finalized = (prefix + sessionFinal).replace(/\s+/g, ' ').trim();
      // Combine finalized text + live interim text so user sees live speech in real time!
      const liveComplete = (finalized + (interim ? ' ' + interim : '')).replace(/\s+/g, ' ').trim();

      console.log('[SpeechRecognition] onresult liveComplete:', liveComplete);
      transcriptRef.current = liveComplete;
      setTranscript(liveComplete);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      // 'no-speech' and 'aborted' are normal occurrences during user pauses or restarts.
      // They must NOT permanently halt recognition!
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      console.warn('[SpeechRecognition] Event issue:', event.error);

      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please check your browser permissions.');
        shouldListenRef.current = false;
        setIsListening(false);
      } else if (event.error === 'service-not-allowed') {
        setError('Speech recognition service not allowed or blocked.');
        shouldListenRef.current = false;
        setIsListening(false);
      } else {
        // Non-fatal error (e.g. 'network')
        console.warn(`[SpeechRecognition] Non-fatal issue: ${event.error}`);
      }
    };

    recognition.onend = () => {
      // Commit whatever was spoken (including trailing interim speech) into persisted baseline
      if (transcriptRef.current) {
        persistedTranscriptRef.current = transcriptRef.current;
      }
      setInterimTranscript('');
      activeInterimRef.current = '';

      // Auto-restart if we are still supposed to be listening
      if (shouldListenRef.current) {
        setTimeout(() => {
          if (shouldListenRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (err) {
              if (err.name !== 'InvalidStateError') {
                console.warn('[SpeechRecognition] Restart note:', err.message);
              }
            }
          }
        }, 150);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      // Clean up on unmount
      shouldListenRef.current = false;
      try {
        recognition.abort();
      } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  const startListening = (language = 'en-US') => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    persistedTranscriptRef.current = '';
    activeInterimRef.current = '';
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    recognitionRef.current.lang = language;
    console.log('[SpeechRecognition] startListening called with language:', language);

    try {
      recognitionRef.current.start();
    } catch (err) {
      if (err.name !== 'InvalidStateError') {
        console.error('[SpeechRecognition] Failed to start recognition:', err);
      }
    }
  };

  const stopListening = () => {
    shouldListenRef.current = false;
    // Commit whatever transcript was captured before stopping
    if (transcriptRef.current) {
      persistedTranscriptRef.current = transcriptRef.current;
    }
    setInterimTranscript('');
    activeInterimRef.current = '';

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        if (err.name !== 'InvalidStateError') {
          console.error('[SpeechRecognition] Failed to stop recognition:', err);
        }
      }
    }
    setIsListening(false);
  };

  const resetTranscript = () => {
    persistedTranscriptRef.current = '';
    activeInterimRef.current = '';
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
  };

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}

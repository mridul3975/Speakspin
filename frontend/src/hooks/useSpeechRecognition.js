import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');
  const shouldListenRef = useRef(false);
  const isStartedRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Use Chrome or Safari for the best experience. Web Speech API is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      isStartedRef.current = true;
      setError(null);
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = transcriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      transcriptRef.current = final;
      setTranscript(final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please check your browser permissions.');
      } else {
        setError(`Speech recognition issue: ${event.error}`);
      }
      shouldListenRef.current = false;
      isStartedRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.warn('Failed to restart recognition:', err);
        }
      } else {
        isStartedRef.current = false;
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      isStartedRef.current = false;
      try {
        recognition.abort();
      } catch (e) {
        console.error('Failed to abort speech recognition on cleanup:', e);
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    
    // Guard against duplicate start calls to prevent race conditions in double-mounting
    if (isStartedRef.current) {
      console.log('Speech recognition is already running. Skipping duplicate start.');
      return;
    }

    shouldListenRef.current = true;
    isStartedRef.current = true;
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    try {
      recognitionRef.current.abort();
    } catch (e) {}

    setTimeout(() => {
      try {
        if (shouldListenRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn('Failed to start recognition (caught):', err);
        isStartedRef.current = false;
      }
    }, 50);
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = false;
    isStartedRef.current = false;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Failed to stop recognition:', err);
    }
    setIsListening(false);
  };

  const resetTranscript = () => {
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

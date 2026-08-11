import { useState, useEffect, useRef } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  // Using a ref for transcript to prevent stale closures in recognition event handlers
  const transcriptRef = useRef('');
  const shouldListenRef = useRef(false);

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
      console.warn('Web Speech API browser-side issue (handled by Whisper fallback):', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please check your browser permissions.');
      } else {
        setError(`Speech recognition issue: ${event.error}`);
      }
      // Halt auto-restart loop on errors to avoid infinite loops and InvalidStateErrors
      shouldListenRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if we are still supposed to be listening
      if (shouldListenRef.current) {
        try {
          recognition.start();
        } catch (err) {
          console.error('Failed to restart recognition:', err);
        }
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = true;
    transcriptRef.current = '';
    setTranscript('');
    setInterimTranscript('');
    setError(null);
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Failed to start recognition:', err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    shouldListenRef.current = false;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Failed to stop recognition:', err);
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
